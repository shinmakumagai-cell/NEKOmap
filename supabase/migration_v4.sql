-- コメントに写真URLカラムを追加
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS photo_url text;
