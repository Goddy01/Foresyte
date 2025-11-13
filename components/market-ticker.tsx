"use client"

export function MarketTicker() {
  const categories = [
    { name: "Politics", emoji: "🏛️" },
    { name: "Sports", emoji: "⚽" },
    { name: "Finance", emoji: "💰" },
    { name: "Crypto", emoji: "₿" },
    { name: "Geopolitics", emoji: "🌍" },
    { name: "Earnings", emoji: "📊" },
    { name: "Tech", emoji: "💻" },
    { name: "Culture", emoji: "🎭" },
    { name: "World", emoji: "🌎" },
    { name: "Economy", emoji: "📈" },
    { name: "Elections", emoji: "🗳️" },
    { name: "Mentions", emoji: "🔔" },
  ]

  // Duplicate for seamless loop
  const duplicatedCategories = [...categories, ...categories]

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-green-400 bg-black/95 backdrop-blur-xl">
      <div className="relative overflow-hidden py-2">
        <div className="flex animate-marquee whitespace-nowrap font-mono">
          {duplicatedCategories.map((category, index) => (
            <div key={index} className="flex items-center gap-3 mx-6">
              <span className="text-green-400">[</span>
              <span className="text-sm font-semibold text-green-400 tracking-wide uppercase">{category.name}</span>
              <span className="text-green-600">]</span>
              <span className="text-amber-400">●</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
