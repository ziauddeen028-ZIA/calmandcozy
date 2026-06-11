export default function Marquee() {
  const items = [
    "🔥 Buy Any 3 T-Shirts for ₹899 Only",
    "⚡ Buy Any 3 Oversized T-Shirts for ₹1199 Only",
    "🚚 Free Shipping All Over India",
  ];

  const allItems = [...items, ...items, ...items, ...items];

  return (
    <div className="bg-gradient-to-r from-[#0f172a] via-[#1e40af] to-[#0f172a] text-white overflow-hidden py-3 relative flex items-center border-b border-white/10">
      <div className="flex animate-marquee whitespace-nowrap items-center h-full">
        {allItems.map((item, index) => (
          <span
            key={index}
            className="px-10 text-sm font-medium tracking-wide"
          >
            {item}
            <span className="mx-4 opacity-50">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}