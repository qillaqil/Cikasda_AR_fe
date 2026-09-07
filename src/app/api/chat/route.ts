import { NextResponse } from "next/server";

// In-memory rate limiter for chat route (5 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // Max 5 requests
const WINDOW_MS = 60 * 1000; // per 1 minute
const MAX_STORED_IPS = 1000; // Prevent unbounded memory growth DoS

function cleanupRateLimitMap(now: number) {
  if (rateLimitMap.size > MAX_STORED_IPS) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.lastReset > WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }
}

export async function POST(req: Request) {
  try {
    const rawIp =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "anonymous";
    const ip = rawIp.split(",")[0].trim();
    const now = Date.now();

    cleanupRateLimitMap(now);

    const limit = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - limit.lastReset > WINDOW_MS) {
      limit.count = 0;
      limit.lastReset = now;
    }

    if (limit.count >= RATE_LIMIT) {
      return NextResponse.json(
        { error: "Terlalu banyak pesan. Silakan tunggu 1 menit sebelum mengirim pesan lagi." },
        { status: 429 }
      );
    }

    limit.count++;
    rateLimitMap.set(ip, limit);

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Format request tidak valid (JSON corrupt)." },
        { status: 400 }
      );
    }

    const { message } = body || {};

    // Validate payload to protect against payload stuffing / token draining attacks
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong dan harus berupa teks." },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { error: "Pesan tidak boleh hanya berisi spasi kosong." },
        { status: 400 }
      );
    }

    if (trimmedMessage.length > 1000) {
      return NextResponse.json(
        { error: "Pesan terlalu panjang (maksimal 1.000 karakter)." },
        { status: 400 }
      );
    }

    const chatApiUrl = process.env.CHAT_API_URL;
    if (!chatApiUrl) {
      return NextResponse.json(
        { error: "Layanan chatbot belum dikonfigurasi di server." },
        { status: 503 }
      );
    }

    // Proxy with timeout to prevent hanging connections
    const response = await fetch(chatApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: trimmedMessage }),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown upstream error");
      console.error("Chat API upstream returned error status:", response.status, errText);
      return NextResponse.json(
        { error: "Layanan asisten CIKASDA sedang mengalami gangguan." },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        { error: "Waktu permintaan chatbot habis (timeout). Silakan coba lagi." },
        { status: 504 }
      );
    }
    console.error("Error proxying to backend chatbot:", error);
    return NextResponse.json(
      { error: "Gagal terhubung ke layanan chatbot CIKASDA." },
      { status: 500 }
    );
  }
}
