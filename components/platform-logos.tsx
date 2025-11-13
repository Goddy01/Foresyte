export function PlatformLogos() {
  const platforms = ["Polymarket", "Manifold", "Kalshi", "Metaculus", "PredictIt"]

  return (
    <div className="mt-16">
      <p className="text-sm font-bold text-muted-foreground mb-8 uppercase tracking-wider">Aggregating Markets From</p>
      <div className="flex flex-wrap justify-center items-center gap-4">
        {platforms.map((platform) => (
          <div
            key={platform}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 hover:border-primary/50 transition-all hover:scale-105 shadow-lg"
          >
            <span className="text-base font-mono font-bold text-foreground">{platform}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
