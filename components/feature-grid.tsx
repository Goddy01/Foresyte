import { Newspaper, TrendingUp, Bell, Target, Sparkles, Zap } from "lucide-react"

const getGradientColors = (gradient: string): { start: string; end: string } => {
  const gradients: Record<string, { start: string; end: string }> = {
    "from-blue-500 to-cyan-500": { start: "#3b82f6", end: "#06b6d4" },
    "from-purple-500 to-pink-500": { start: "#a855f7", end: "#ec4899" },
    "from-emerald-500 to-teal-500": { start: "#10b981", end: "#14b8a6" },
    "from-orange-500 to-red-500": { start: "#f97316", end: "#ef4444" },
    "from-yellow-500 to-amber-500": { start: "#eab308", end: "#f59e0b" },
    "from-indigo-500 to-violet-500": { start: "#6366f1", end: "#8b5cf6" },
  }
  return gradients[gradient] || { start: "#6366f1", end: "#8b5cf6" }
}

const features = [
  {
    icon: Newspaper,
    title: "Predictor-Optimized Format",
    description: "News presented in a format designed for predictors. Structured to help you make decisions quickly and accurately.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconGradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Market Impact Indicators",
    description: "Visual indicators show how news affects markets. Instantly see which stories move odds and by how much.",
    gradient: "from-purple-500/20 to-pink-500/20",
    iconGradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Target,
    title: "Actionable Information Layout",
    description: "Information structured for prediction decisions. Key facts upfront, relevant markets linked, probabilities highlighted.",
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconGradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Bell,
    title: "Breaking News Alerts",
    description: "Instant notifications when news breaks. Formatted to show market impact potential before you even read.",
    gradient: "from-orange-500/20 to-red-500/20",
    iconGradient: "from-orange-500 to-red-500",
  },
  {
    icon: Sparkles,
    title: "AI-Enhanced Presentation",
    description: "AI formats news insights in predictor-friendly layouts. Key data extracted, markets connected, context provided.",
    gradient: "from-yellow-500/20 to-amber-500/20",
    iconGradient: "from-yellow-500 to-amber-500",
  },
  {
    icon: Zap,
    title: "Real-Time Aggregated Feed",
    description: "All news in one unified format across Polymarket, Manifold, Kalshi, and beyond. Consistent, usable, focused.",
    gradient: "from-indigo-500/20 to-violet-500/20",
    iconGradient: "from-indigo-500 to-violet-500",
  },
]

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => {
        const Icon = feature.icon
        const colors = getGradientColors(feature.iconGradient)
        return (
          <div
            key={feature.title}
            className={`group relative rounded-3xl border-2 border-border bg-gradient-to-br ${feature.gradient} p-8 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 overflow-hidden`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
              <div
                className={`mb-5 relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} border-2 border-white/10 group-hover:scale-110 transition-transform duration-300`}
              >
                <svg className="absolute w-0 h-0" aria-hidden="true">
                  <defs>
                    <linearGradient id={`icon-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={colors.start} />
                      <stop offset="100%" stopColor={colors.end} />
                    </linearGradient>
                  </defs>
                </svg>
                <Icon
                  className="h-8 w-8"
                  style={{
                    stroke: `url(#icon-gradient-${index})`,
                    fill: "none",
                  }}
                />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
            </div>

            <div
              className={`absolute -top-12 -right-12 h-24 w-24 rounded-full bg-gradient-to-br ${feature.iconGradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-300`}
            />
          </div>
        )
      })}
    </div>
  )
}
