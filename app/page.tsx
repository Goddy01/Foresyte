"use client"

import { WaitlistForm } from "@/components/waitlist-form"
import { FeatureGrid } from "@/components/feature-grid"
// import { PlatformLogos } from "@/components/platform-logos"
import { MarketTicker } from "@/components/market-ticker"
import { TrendingUp, Zap } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import Image from "next/image"

export default function Home() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)

  return (
    <main className="min-h-screen bg-black text-green-400 relative">
      <MarketTicker />

      {/* Logo Pill - Top Left */}
      <div className="fixed top-[60px] left-0 z-50 pl-4 pt-3">
        <div className="flex items-center gap-2 border border-green-400 px-3 py-1.5 bg-black/80 backdrop-blur-sm w-fit font-mono">
          {/* <Image
            src="/Foresyte-logo/profile.png"
            alt="Foresyte Logo"
            width={24}
            height={24}
            className="rounded-full"
          /> */}
          <span className="text-lg font-black text-green-400">FORESYTE</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-green-400/20 min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff0020_1px,transparent_1px),linear-gradient(to_bottom,#00ff0020_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8 w-full">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-10 inline-flex items-center gap-2 border border-green-400 bg-black px-4 py-2 font-mono">
              <span className="text-green-400 uppercase tracking-wider">[COMING SOON]</span>
            </div>

            <h1 className="text-balance text-4xl sm:text-6xl md:text-7xl font-mono tracking-tight text-green-400 mb-8 leading-[1.1]">
              <div className="mb-2">
                <span className="text-amber-400"></span> THE{" "}
                <span className="text-green-300">AI NEWS FEED</span>
              </div>
              <div>BUILT FOR PREDICTION MARKETS</div>
            </h1>

            <div className="border-2 border-green-400 bg-black/90 p-8 mb-16 max-w-3xl mx-auto text-left font-mono shadow-[0_0_30px_rgba(0,255,0,0.3)] relative">
              <div className="absolute top-0 left-0 right-0 border-b border-green-400 bg-green-400/10 py-2 px-4 text-green-400 text-xs uppercase tracking-wider font-bold">
                <span className="text-amber-400">$</span> SYSTEM INFO
              </div>
              <div className="pt-12 space-y-3">
                <p className="text-green-400 text-base sm:text-lg leading-relaxed">
                  <span className="text-green-600 font-bold">#</span> AI-powered curated news feed designed specifically for prediction market traders.
                </p>
                <p className="text-green-400 text-base sm:text-lg leading-relaxed">
                  <span className="text-green-600 font-bold">#</span> Not traditional news, content optimized for quick and accurate decisions.
                </p>
                {/* <p className="text-green-400 text-base sm:text-lg leading-relaxed">
                  <span className="text-green-600 font-bold">#</span> Aggregated from Polymarket, Manifold, Kalshi, and beyond.
                </p> */}
              </div>
            </div>

            {/* Platform Logos */}
            {/* <PlatformLogos /> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8 border-t border-green-400/20">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-mono tracking-tight text-green-400 mb-6">
            <span className="text-amber-400"></span> FOR TRADERS WHO DEMAND THE EDGE
          </h2>
        </div>

        <FeatureGrid />

        <div className="flex items-center justify-center mt-16">
          <button
            onClick={() => setIsWaitlistOpen(true)}
            className="group inline-flex items-center gap-2 border border-green-400 bg-black px-8 py-4 text-base font-mono text-green-400 hover:bg-green-400 hover:text-black transition-all"
          >
            <span className="text-amber-400"></span>
            JOIN_WAITLIST
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-400/20">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <p className="text-center text-sm text-green-400/60 font-mono">
            <span className="text-green-600">©</span> 2025 FORESYTE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      {/* Waitlist Modal */}
      <Dialog open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-center mb-2"></DialogTitle>
          </DialogHeader>
          <WaitlistForm onSuccess={() => setIsWaitlistOpen(false)} />
        </DialogContent>
      </Dialog>
    </main>
  )
}
