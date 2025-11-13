import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, features } = await request.json()

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Log the submission (in production, you'd save to database or send to email service)
    console.log("[v0] Waitlist submission:", {
      email,
      features: features || "No features specified",
      timestamp: new Date().toISOString(),
    })

    // TODO: Connect to your backend or email service
    // Examples:
    // - Save to Supabase/database
    // - Send to email marketing service (Resend, SendGrid, etc.)
    // - Post to webhook/Discord/Slack for notifications

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Waitlist submission error:", error)
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 })
  }
}
