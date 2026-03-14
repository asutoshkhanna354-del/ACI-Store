# Aci Store - Self-Hosting Setup Guide

## Requirements
- Ubuntu/Debian Linux server (or any Linux VPS)
- Node.js 18+ 
- PostgreSQL 14+
- nginx (for reverse proxy)
- A domain name (optional but recommended)

## Step 1: Install Dependencies on Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install nginx
sudo apt install -y nginx

# Install certbot (for free SSL)
sudo apt install -y certbot python3-certbot-nginx
```

## Step 2: Set Up PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL shell:
CREATE USER acistore WITH PASSWORD 'your_strong_password_here';
CREATE DATABASE acistore OWNER acistore;
GRANT ALL PRIVILEGES ON DATABASE acistore TO acistore;
\q
```

## Step 3: Upload Your Project Files

Upload the entire `Panel-Store-Master` folder to your server. You can use:
- **SCP**: `scp -r Panel-Store-Master/ user@your-server-ip:/home/user/`
- **Git**: Push to GitHub/GitLab and clone on server
- **SFTP**: Use FileZilla or similar

## Step 4: Import Your Database

```bash
cd /home/user/Panel-Store-Master
psql -U acistore -d acistore -f database_backup.sql
```

This imports ALL your data - panels, settings, users, orders, keys, everything.

## Step 5: Upload Your Panel Images

If you have any uploaded images/videos from your Replit site, copy the `server/uploads/` folder content to the same path on your new server.

## Step 6: Install Node Dependencies & Build Frontend

```bash
cd /home/user/Panel-Store-Master

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies and build
cd client && npm install && npx vite build && cd ..
```

## Step 7: Set Environment Variables

Create a file `/home/user/Panel-Store-Master/.env`:

```bash
DATABASE_URL=postgresql://acistore:your_strong_password_here@localhost:5432/acistore
PORT=5000
JWT_SECRET=your_random_secret_key_here
NODE_ENV=production
```

Generate a random JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 8: Set Up Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the app
cd /home/user/Panel-Store-Master
pm2 start server/index.js --name "aci-store" --env production

# Make it auto-start on server reboot
pm2 startup
pm2 save
```

## Step 9: Set Up nginx Reverse Proxy

Create nginx config:

```bash
sudo nano /etc/nginx/sites-available/acistore
```

Paste this (replace `yourdomain.com` with your domain):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/acistore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 10: Get Free SSL Certificate (HTTPS)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will auto-configure nginx for HTTPS.

## Step 11: Point Your Domain

Go to your domain registrar and add an **A record**:
- **Type**: A
- **Name**: @ (or your subdomain)
- **Value**: Your server's IP address
- **TTL**: 300

Also add for www:
- **Type**: A  
- **Name**: www
- **Value**: Your server's IP address

## Useful Commands

```bash
# View app logs
pm2 logs aci-store

# Restart app
pm2 restart aci-store

# Stop app
pm2 stop aci-store

# Monitor app
pm2 monit
```

## If Using a VPS Without Domain (IP Only)

Skip the nginx SSL step. In the nginx config, just use:
```
server_name your_server_ip;
```
Your site will be available at `http://your_server_ip`

## Recommended VPS Providers (Budget)
- **Hetzner** - Starting at ~$4/month (best value)
- **DigitalOcean** - Starting at $6/month
- **Vultr** - Starting at $5/month
- **Contabo** - Starting at ~$5/month
- **Oracle Cloud** - Free tier available (always free)
