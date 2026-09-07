export interface DatabaseProject {
  id: string;
  target_index: number;
  slug: string;
  category_id: string;
  category_en: string;
  title_id: string;
  title_en: string;
  description_id: string;
  description_en: string;
  model_url: string;
  model_scale: string;
  marker_image_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  cards?: DatabaseProjectCard[];
}

export interface DatabaseProjectCard {
  id?: string;
  project_id?: string;
  slot_index: number;
  icon_name: string;
  label_id: string;
  label_en: string;
  value_id: string;
  value_en: string;
  detail_id: string;
  detail_en: string;
}

export interface MindARBundle {
  id: string;
  version: number;
  bundle_url: string;
  total_targets: number;
  is_active: boolean;
  created_at: string;
}
