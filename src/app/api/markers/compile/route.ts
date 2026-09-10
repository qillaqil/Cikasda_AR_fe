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
    const totalTargets = formData.get("totalTargets") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "File binary targets.mind tidak ditemukan dalam request." },
        { status: 400 }
      );
    }

    const numTargets = parseInt(totalTargets || "1", 10) || 1;

    // Inisialisasi Supabase Admin Client dengan Service Role Key untuk bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Upload sebagai file utama 'targets.mind' (selalu di-upsert untuk rujukan WebAR)
    const { error: uploadPrimaryError } = await supabaseAdmin.storage
      .from("ar-markers")
      .upload("targets.mind", buffer, {
        contentType: "application/octet-stream",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadPrimaryError) {
      console.error("Primary upload error:", uploadPrimaryError);
      return NextResponse.json(
        { error: `Gagal mengunggah targets.mind ke storage: ${uploadPrimaryError.message}` },
        { status: 500 }
      );
    }

    // 2. Upload salinan versi terarsip: targets-v{timestamp}.mind
    const versionedFileName = `targets-v${Date.now()}.mind`;
    await supabaseAdmin.storage
      .from("ar-markers")
      .upload(versionedFileName, buffer, {
        contentType: "application/octet-stream",
        cacheControl: "3600",
        upsert: true,
      });

    // 3. Ambil URL Publik targets.mind
    const { data: publicData } = supabaseAdmin.storage
      .from("ar-markers")
      .getPublicUrl("targets.mind");

    const bundleUrl = publicData?.publicUrl || `${supabaseUrl}/storage/v1/object/public/ar-markers/targets.mind`;

    // 4. Nonaktifkan bundle lama di tabel mindar_bundles
    await supabaseAdmin
      .from("mindar_bundles")
      .update({ is_active: false })
      .eq("is_active", true);

    // 5. Masukkan row baru bundle aktif ke tabel mindar_bundles
    const { data: newBundle, error: insertError } = await supabaseAdmin
      .from("mindar_bundles")
      .insert({
        bundle_url: bundleUrl,
        total_targets: numTargets,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert mindar_bundles error:", insertError);
      // Tetap kembalikan sukses storage jika hanya tabel yang gagal, tapi berikan info
      return NextResponse.json({
        success: true,
        bundleUrl,
        warning: `File terunggah ke storage, tapi pencatatan tabel gagal: ${insertError.message}`,
      });
    }

    return NextResponse.json({
      success: true,
      bundleUrl,
      bundle: newBundle,
      message: `File targets.mind berhasil disimpan ke Supabase Storage (${numTargets} target aktif)!`,
    });
  } catch (err: unknown) {
    console.error("Compile API route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan server saat menyimpan bundle marker." },
      { status: 500 }
    );
  }
}
