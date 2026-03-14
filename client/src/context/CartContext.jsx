import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ff_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ff_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (panel, duration) => {
    let price = 0;
    const fixedFields = { '1day': 'price_1day', '7day': 'price_7day', '30day': 'price_30day', '60day': 'price_60day' };
    if (fixedFields[duration]) {
      price = parseFloat(panel[fixedFields[duration]]);
    } else {
      const dayMatch = duration.match(/^(\d+)day$/);
      if (dayMatch) {
        const customPrices = panel.custom_prices || {};
        const cp = customPrices[dayMatch[1]];
        if (cp) price = parseFloat(cp.price);
      }
    }
    if (!price || price <= 0) return;
    const item = {
      id: `${panel.id}_${duration}_${Date.now()}`,
      panel_id: panel.id,
      panel_name: panel.name,
      duration,
      price,
      section_name: panel.section_name
    };
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
