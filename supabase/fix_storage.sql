-- spot-photos バケットを作成（存在しない場合）
INSERT INTO storage.buckets (id, name, public)
VALUES ('spot-photos', 'spot-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 誰でもアップロード可能にする（認証済みユーザー）
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'spot-photos');

-- 誰でも閲覧可能にする
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'spot-photos');

-- 自分のファイルを削除可能にする
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'spot-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- comments テーブルに photo_url カラムを追加（存在しない場合）
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS photo_url text;
