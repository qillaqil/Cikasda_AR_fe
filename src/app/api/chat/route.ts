import { NextResponse } from "next/server";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // Max 5 requests
const WINDOW_MS = 60000; // per 1 minute

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const now = Date.now();
  const limit = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - limit.lastReset > WINDOW_MS) {
    limit.count = 0;
    limit.lastReset = now;
  }

  if (limit.count >= RATE_LIMIT) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  limit.count++;
  rateLimitMap.set(ip, limit);

  try {
    const { message } = await req.json();
    const response = await fetch(process.env.CHAT_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying to backend:", error);
    return NextResponse.json(
      { error: "Failed to connect to chatbot service" },
      { status: 500 },
    );
  }
}
