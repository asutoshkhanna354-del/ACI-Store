export default function Logo({ size = 28 }) {
  return (
    <img
      src="/store-logo.jpeg"
      alt="Aci Store"
      style={{
        width: size,
        height: size,
        borderRadius: '6px',
        objectFit: 'cover',
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
    />
  );
}
