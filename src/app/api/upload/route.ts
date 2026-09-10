import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Konfigurasi server Supabase (SUPABASE_SERVICE_ROLE_KEY) belum lengkap." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string | null) || "ar-markers";

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan dalam request." },
        { status: 400 }
      );
    }

    const allowedBuckets = ["ar-markers", "ar-models"];
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json(
        { error: `Bucket '${bucket}' tidak diizinkan. Gunakan 'ar-markers' atau 'ar-models'.` },
        { status: 400 }
      );
    }

    // Inisialisasi Supabase Admin Client dengan Service Role Key untuk bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const contentType = file.type || (bucket === "ar-models" ? "model/gltf-binary" : "image/jpeg");

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(safeName, buffer, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(`Upload error to ${bucket}:`, uploadError);
      return NextResponse.json(
        { error: `Gagal mengunggah file ke bucket ${bucket}: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: publicData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    const publicUrl =
      publicData?.publicUrl ||
      `${supabaseUrl}/storage/v1/object/public/${bucket}/${uploadData.path}`;

    return NextResponse.json({
      success: true,
      path: uploadData.path,
      publicUrl,
      fileName: safeName,
    });
  } catch (err: unknown) {
    console.error("Upload API route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan server saat mengunggah file." },
      { status: 500 }
    );
  }
}
