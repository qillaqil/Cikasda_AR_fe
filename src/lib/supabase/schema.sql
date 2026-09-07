-- ==============================================================================
-- CIKASDA WebAR - Supabase Database Schema & Storage Setup
-- ==============================================================================
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda.
-- Skrip ini akan membuat tabel, relasi, storage bucket, dan mengisi data awal (seed).
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PROYEK AR (ar_projects)
CREATE TABLE IF NOT EXISTS public.ar_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_index INT UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category_id VARCHAR(100) NOT NULL,
    category_en VARCHAR(100) NOT NULL,
    title_id VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    description_id TEXT NOT NULL,
    description_en TEXT NOT NULL,
    model_url TEXT NOT NULL,
    model_scale VARCHAR(50) DEFAULT '0.1 0.1 0.1',
    marker_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL 4 KARTU DETAIL (ar_project_cards)
CREATE TABLE IF NOT EXISTS public.ar_project_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.ar_projects(id) ON DELETE CASCADE,
    slot_index INT NOT NULL CHECK (slot_index >= 0 AND slot_index <= 3),
    icon_name VARCHAR(50) DEFAULT 'Building2',
    label_id VARCHAR(100) NOT NULL,
    label_en VARCHAR(100) NOT NULL,
    value_id VARCHAR(255) NOT NULL,
    value_en VARCHAR(255) NOT NULL,
    detail_id TEXT NOT NULL,
    detail_en TEXT NOT NULL,
    UNIQUE(project_id, slot_index)
);

-- 4. TABEL RIWAYAT KOMPILASI MINDAR (mindar_bundles)
CREATE TABLE IF NOT EXISTS public.mindar_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version INT NOT NULL DEFAULT 1,
    bundle_url TEXT NOT NULL,
    total_targets INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.ar_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_project_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mindar_bundles ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Publik dapat membaca data proyek aktif
CREATE POLICY "Public Read Active Projects" ON public.ar_projects
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public Read Cards" ON public.ar_project_cards
    FOR SELECT USING (true);

CREATE POLICY "Public Read Bundles" ON public.mindar_bundles
    FOR SELECT USING (is_active = true);

-- Kebijakan: Admin (user terautentikasi) memiliki kontrol penuh (CRUD)
CREATE POLICY "Admin Full Access Projects" ON public.ar_projects
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Full Access Cards" ON public.ar_project_cards
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Full Access Bundles" ON public.mindar_bundles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. SETUP STORAGE BUCKETS (ar-models & ar-markers)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('ar-models', 'ar-models', true),
    ('ar-markers', 'ar-markers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Kebijakan Storage: Publik bisa download/baca file
CREATE POLICY "Public Access ar-models" ON storage.objects
    FOR SELECT USING (bucket_id = 'ar-models');

CREATE POLICY "Public Access ar-markers" ON storage.objects
    FOR SELECT USING (bucket_id = 'ar-markers');

-- Kebijakan Storage: Admin terautentikasi bisa upload dan hapus file
CREATE POLICY "Admin Upload ar-models" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ar-models');

CREATE POLICY "Admin Update ar-models" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'ar-models');

CREATE POLICY "Admin Delete ar-models" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'ar-models');

CREATE POLICY "Admin Upload ar-markers" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ar-markers');

CREATE POLICY "Admin Update ar-markers" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'ar-markers');

CREATE POLICY "Admin Delete ar-markers" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'ar-markers');

-- ==============================================================================
-- 7. SEED DATA AWAL (Mengisi 3 Proyek Awal CIKASDA)
-- ==============================================================================
DO $$
DECLARE
    p0_id UUID;
    p1_id UUID;
    p2_id UUID;
BEGIN
    -- Proyek 0: Masjid Raya Baitul Khairaat
    INSERT INTO public.ar_projects (
        target_index, slug, category_id, category_en,
        title_id, title_en, description_id, description_en,
        model_url, model_scale, marker_image_url
    ) VALUES (
        0, 'masjid-raya-baitul-khairaat',
        'Bangunan Gedung & Religi', 'Building & Religious Infrastructure',
        'Masjid Raya Baitul Khairaat', 'Baitul Khairaat Grand Mosque',
        'Tempat ibadah umat Islam terbesar di Sulawesi Tengah berkonsep modern-kontemporer tahan gempa.',
        'The largest Islamic place of worship in Central Sulawesi featuring modern earthquake-resistant architecture.',
        '/models/mosque.glb', '0.1 0.1 0.1', '/contohAR.png'
    ) RETURNING id INTO p0_id;

    -- Kartu untuk Proyek 0
    INSERT INTO public.ar_project_cards (project_id, slot_index, icon_name, label_id, label_en, value_id, value_en, detail_id, detail_en)
    VALUES
    (p0_id, 0, 'Building2', 'Bangunan Utama', 'Main Building', 'Masjid Raya Baitul Khairaat', 'Baitul Khairaat Grand Mosque',
     'Masjid Raya Baitul Khairaat (dahulu kawasan Masjid Agung Darussalam) merupakan tempat ibadah umat Islam terbesar di Sulawesi Tengah di atas lahan 4 hektare. Desain modern-kontemporer dengan simbolisme numerik Al-Qur''an (tinggi 30m melambangkan 30 juz) dan struktur tahan gempa SNI didukung 483 tiang pancang.',
     'Baitul Khairaat Grand Mosque is the largest Islamic place of worship in Central Sulawesi standing on 4 hectares. Features modern-contemporary design rich in Qur''anic symbolism (30m height symbolizing 30 juz) and earthquake-resistant structures.'),
    (p0_id, 1, 'Users', 'Fungsi & Ibadah', 'Functions & Worship', 'Fungsi Sosial & Ibadah', 'Social & Worship Functions',
     'Fungsi Ibadah: Sarana utama salat fardu berjemaah, salat Jumat, Id, iktikaf, dan pengajian rutin berkapasitas 10.000 - 15.000 jemaah.\n\nFungsi Sosial: Pusat pemberdayaan umat, pengelolaan ZIS, serta ruang silaturahmi warga (Hablum minannas).',
     'Worship Function: Main facility for congregational prayers and gatherings with a capacity of 10,000 - 15,000 worshippers.\n\nSocial Function: Community empowerment center, ZIS management, and public gathering space.'),
    (p0_id, 2, 'CalendarDays', 'Tahun Peresmian', 'Inauguration Year', '2025 (4 Desember)', '2025 (December 4)',
     'Tahun Pendataan & Peresmian: 2025. Diresmikan pada 4 Desember 2025 setelah proses pembangunan kembali pascabencana gempa bumi guna memenuhi standar struktur tahan gempa.',
     'Inaugurated on December 4, 2025 after reconstruction following post-earthquake recovery programs to meet national earthquake-resistant building standards.'),
    (p0_id, 3, 'MapPin', 'Kawasan & Lokasi', 'Area & Location', 'Palu, Sulawesi Tengah', 'Palu, Central Sulawesi',
     'Alamat: Jl. Jaelangkara / Jl. WR Supratman, Kelurahan Baru, Kecamatan Palu Barat, Kota Palu, Sulawesi Tengah.\n\nKoordinat Peta: Berada strategis di pusat kota Palu, tidak jauh dari pesisir Teluk Palu.',
     'Address: Jl. Jaelangkara / Jl. WR Supratman, West Palu, Palu City, Central Sulawesi.\n\nStrategically located near the Palu Bay coastline.');

    -- Proyek 1: Bendungan Irigasi CIKASDA
    INSERT INTO public.ar_projects (
        target_index, slug, category_id, category_en,
        title_id, title_en, description_id, description_en,
        model_url, model_scale, marker_image_url
    ) VALUES (
        1, 'bendungan-irigasi-cikasda',
        'Sumber Daya Air (SDA)', 'Water Resources Infrastructure',
        'Bendungan Irigasi CIKASDA', 'CIKASDA Irrigation Dam',
        'Infrastruktur penampungan dan pengelolaan air strategis untuk mendukung irigasi pertanian daerah.',
        'Strategic water storage and management infrastructure to support regional agricultural irrigation.',
        '/models/bendungan.glb', '0.05 0.05 0.05', '/contohAR.png'
    ) RETURNING id INTO p1_id;

    -- Kartu untuk Proyek 1
    INSERT INTO public.ar_project_cards (project_id, slot_index, icon_name, label_id, label_en, value_id, value_en, detail_id, detail_en)
    VALUES
    (p1_id, 0, 'Building2', 'Tipe Struktur', 'Structure Type', 'Urugan Batu Inti Kedap', 'Rock-fill Core Dam',
     'Bendungan berstruktur urugan batu dengan inti kedap air. Didesain menahan debit air berskala besar, dilengkapi pintu pelimpah (spillway) serta sistem monitoring tekanan air otomatis.',
     'A rock-fill dam structure with an impervious clay core. Equipped with spillway gates and automated water pressure monitoring systems.'),
    (p1_id, 1, 'Users', 'Kapasitas Tampung', 'Storage Capacity', '15 Juta m³ Air', '15 Million m³ Water',
     'Memiliki kapasitas tampungan efektif hingga 15 Juta m³ air untuk menjaga ketersediaan pasokan air baku dan mengendalikan risiko banjir di wilayah hilir saat curah hujan tinggi.',
     'Holds an effective storage capacity of up to 15 Million m³ of water reserves to control regional flood risks during high rainfall seasons.'),
    (p1_id, 2, 'CalendarDays', 'Tinggi Elevasi', 'Elevation Height', '45 Meter', '45 Meters',
     'Struktur bendungan berdiri setinggi 45 meter dari dasar pondasi untuk memastikan stabilitas tekanan air dan distribusi aliran irigasi yang optimal.',
     'Standing 45 meters high from foundation levels to ensure structural stability and optimal irrigation flow pressure.'),
    (p1_id, 3, 'MapPin', 'Cakupan Irigasi', 'Irrigation Coverage', '1.500 Hektar Sawah', '1,500 Hektar Farmland',
     'Mengalirkan air secara konsisten ke jaringan irigasi primer dan sekunder untuk mengairi lebih dari 1.500 hektar lahan pertanian di Sulawesi Tengah.',
     'Consistently delivers water through primary and secondary irrigation networks to over 1,500 hectares of agricultural land.');

    -- Proyek 2: Jaringan SPAM Regional
    INSERT INTO public.ar_projects (
        target_index, slug, category_id, category_en,
        title_id, title_en, description_id, description_en,
        model_url, model_scale, marker_image_url
    ) VALUES (
        2, 'jaringan-spam-regional',
        'Cipta Karya & Air Minum', 'Human Settlements & Water Supply',
        'Jaringan SPAM Regional', 'Regional Water Supply System',
        'Sistem Penyediaan Air Minum terpadu untuk menjamin ketersediaan air bersih pemukiman warga.',
        'Integrated Water Supply Provision System to guarantee clean water availability for residential areas.',
        '/models/cikasda.glb', '0.2 0.2 0.2', '/contohAR.png'
    ) RETURNING id INTO p2_id;

    -- Kartu untuk Proyek 2
    INSERT INTO public.ar_project_cards (project_id, slot_index, icon_name, label_id, label_en, value_id, value_en, detail_id, detail_en)
    VALUES
    (p2_id, 0, 'Building2', 'Kapasitas Debit', 'Flow Rate Capacity', '300 Liter / Detik', '300 Liters / Second',
     'Infrastruktur pengolahan air minum modern ini menyalurkan air bersih steril dengan debit kapasitas mencapai 300 liter per detik.',
     'Modern water treatment plant system delivering clean potable water at flow rates reaching 300 Liters per Second.'),
    (p2_id, 1, 'Users', 'Panjang Jaringan', 'Network Length', '18.5 Kilometer', '18.5 Kilometers',
     'Konstruksi pipa transmisi bertekanan tinggi membentang sepanjang 18.5 kilometer menggunakan material HDPE standar industri yang tahan korosi dan guncangan tanah.',
     'High-pressure pipeline network spanning 18.5 kilometers constructed with industrial HDPE corrosion-resistant materials.'),
    (p2_id, 2, 'CalendarDays', 'Target Layanan', 'Service Target', '25.000 Sambungan (SR)', '25,000 House Connections',
     'Dirancang untuk memberikan akses air bersih layak minum secara langsung kepada lebih dari 25.000 Sambungan Rumah (SR) pemukiman warga.',
     'Designed to supply direct potable water connections to over 25,000 residential households.'),
    (p2_id, 3, 'MapPin', 'Tahun Pembangunan', 'Construction Year', '2025 - 2026', '2025 - 2026',
     'Masuk dalam program prioritas pemerintah daerah untuk memperluas pencapaian sanitasi dan air bersih berkualitas di Sulawesi Tengah.',
     'Part of priority public works programs expanding regional clean water coverage in Central Sulawesi.');

END $$;
