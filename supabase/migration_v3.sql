-- v3: スポットに写真URLカラムを追加
ALTER TABLE public.spots ADD COLUMN IF NOT EXISTS photo_url text;

-- Storage: spot-photos バケットを作成（Supabase Dashboard > Storage で手動作成も可）
-- INSERT INTO storage.buckets (id, name, public) VALUES ('spot-photos', 'spot-photos', true);
