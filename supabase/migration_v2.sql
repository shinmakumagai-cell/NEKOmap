-- ============================================
-- Migration V2: プレミアム機能リニューアル
-- ============================================

-- ① 既存プレミアム制限の撤廃
-- cats テーブル: プレミアム制限解除
DROP POLICY "プレミアムユーザーのみ猫登録可" ON public.cats;
CREATE POLICY "ログイン済みユーザーは猫登録可"
  ON public.cats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- favorites テーブル: プレミアム制限解除
DROP POLICY "プレミアムユーザーのみお気に入り登録可" ON public.favorites;
CREATE POLICY "ログイン済みユーザーはお気に入り登録可"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ② profiles テーブルに新カラム追加
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marker_type text DEFAULT 'default';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marker_photo_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS title text;

-- ③ cats テーブルにAI分析カラム追加
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS ai_breed text;
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS ai_age text;
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS ai_features text[];

-- ④ ai_cat_analyses テーブル（AI分析結果保存）
CREATE TABLE public.ai_cat_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cat_id uuid REFERENCES public.cats(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  breed text,
  estimated_age text,
  features text[],
  confidence double precision,
  raw_response jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_cat_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI分析結果は全員閲覧可"
  ON public.ai_cat_analyses FOR SELECT USING (true);

CREATE POLICY "プレミアムユーザーのみAI分析登録可"
  ON public.ai_cat_analyses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_premium = true
    )
  );

-- ⑤ regional_scores テーブル（地域スコア・ランキング）
CREATE TABLE public.regional_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  region text NOT NULL DEFAULT '全国',
  spots_count int DEFAULT 0,
  cats_count int DEFAULT 0,
  comments_count int DEFAULT 0,
  total_score int DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, region)
);

ALTER TABLE public.regional_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "スコアは全員閲覧可"
  ON public.regional_scores FOR SELECT USING (true);

CREATE POLICY "自分のスコアは登録可"
  ON public.regional_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "自分のスコアは更新可"
  ON public.regional_scores FOR UPDATE
  USING (auth.uid() = user_id);
