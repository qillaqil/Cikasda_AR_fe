import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY belum dikonfigurasi di file .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { title, category, description, cards } = body;

    const systemPrompt = `You are a professional translator and technical editor for Dinas CIKASDA (Cipta Karya & Sumber Daya Air - Public Works & Water Resources Department) Central Sulawesi, Indonesia.
Your task is to translate government public infrastructure project information from Indonesian to formal, professional English.

Input contains:
- title: Project Title
- category: Infrastructure category (e.g. "Sumber Daya Air (SDA)" -> "Water Resources Management", "Cipta Karya & Air Minum" -> "Human Settlements & Drinking Water Supply")
- description: Summary paragraph
- cards: Array of 4 specification items, each having:
  - label: short card title
  - value: key figure / summary text
  - detail: detailed technical explanation

Respond ONLY with valid JSON in this exact schema:
{
  "title_en": "translated title",
  "category_en": "translated category",
  "description_en": "translated description",
  "cards": [
    {
      "label_en": "translated label",
      "value_en": "translated value",
      "detail_en": "translated detail"
    }
  ]
}`;

    const userContent = JSON.stringify({
      title: title || "",
      category: category || "",
      description: description || "",
      cards: (cards || []).map((c: { label_id?: string; value_id?: string; detail_id?: string }) => ({
        label: c.label_id || "",
        value: c.value_id || "",
        detail: c.detail_id || "",
      })),
    });

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Translate this Indonesian project into English:\n${userContent}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", errText);
      return NextResponse.json(
        { error: "Gagal memproses terjemahan via Groq API", details: errText },
        { status: groqResponse.status }
      );
    }

    const groqData = await groqResponse.json();
    const rawContent = groqData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { error: "Groq tidak mengembalikan respon terjemahan" },
        { status: 500 }
      );
    }

    const parsedTranslation = JSON.parse(rawContent);
    return NextResponse.json(parsedTranslation);
  } catch (error: unknown) {
    console.error("Translation route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan pada server terjemahan" },
      { status: 500 }
    );
  }
}
