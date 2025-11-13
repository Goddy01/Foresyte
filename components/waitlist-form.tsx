"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Sparkles } from "lucide-react"

interface WaitlistFormProps {
  onSuccess?: () => void
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState("")
  const [features, setFeatures] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, features }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit")
      }

      setIsSubmitted(true)
      setEmail("")
      setFeatures("")
      // Close modal after a delay if onSuccess callback is provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-primary/20 to-accent/20 p-12 text-center shadow-2xl shadow-primary/20">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/30 shadow-lg shadow-primary/50">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-3xl font-black text-foreground mb-3">You're on the list!</h3>
        <p className="text-lg text-foreground/80 font-medium">
          We'll notify you when Foresyte launches. Get ready to dominate prediction markets.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border-2 border-primary/30 bg-card/80 backdrop-blur-sm p-6 sm:p-10 shadow-2xl shadow-primary/10">
        <div className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-foreground font-bold text-base">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="trader@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background border-2 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary h-14 text-base rounded-xl transition-all"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="features" className="text-foreground font-bold text-base flex items-center gap-2">
              What features do you want to see? (Optional)
            </Label>
            <Textarea
              id="features"
              placeholder="Tell us what features matter most to you..."
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={5}
              className="bg-background border-2 border-primary/20 text-foreground placeholder:text-muted-foreground resize-none focus:border-primary rounded-xl text-base transition-all"
            />
            <p className="text-sm text-muted-foreground font-medium">Your input helps us prioritize development</p>
          </div>

          {error && (
            <div className="rounded-xl border-2 border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm text-destructive font-semibold">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black border-2 border-green-400 hover:bg-green-400 hover:text-black text-green-400 font-mono font-bold text-lg h-16 transition-all"
            size="lg"
          >
            {isSubmitting ? "JOINING..." : "JOIN THE WAITLIST"}
          </Button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground font-medium">
        By joining, you agree to receive updates about Foresyte. Unsubscribe anytime.
      </p>
    </form>
  )
}
