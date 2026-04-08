-- ① profiles テーブル（Supabase Auth と連携）
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  is_premium boolean default false,
  premium_since timestamptz,
  stripe_customer_id text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "プロフィールは全員閲覧可"
  on public.profiles for select using (true);

create policy "自分のプロフィールは自分だけ更新可"
  on public.profiles for update using (auth.uid() = id);

-- 新規ユーザー登録時に自動でprofileを作成するトリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ② spots テーブル
create table public.spots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  lat double precision not null,
  lng double precision not null,
  is_sponsored boolean default false,
  created_at timestamptz default now()
);

alter table public.spots enable row level security;

create policy "スポットは全員閲覧可"
  on public.spots for select using (true);

create policy "ログイン済みユーザーは登録可"
  on public.spots for insert with check (auth.uid() = user_id);

create policy "自分のスポットは削除可"
  on public.spots for delete using (auth.uid() = user_id);

-- ③ cats テーブル（プレミアム機能）
create table public.cats (
  id uuid default gen_random_uuid() primary key,
  spot_id uuid references public.spots(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  name text,
  personality text,
  photo_url text,
  created_at timestamptz default now()
);

alter table public.cats enable row level security;

create policy "猫情報は全員閲覧可"
  on public.cats for select using (true);

create policy "プレミアムユーザーのみ猫登録可"
  on public.cats for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_premium = true
    )
  );

-- ④ comments テーブル
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  spot_id uuid references public.spots(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

alter table public.comments enable row level security;

create policy "コメントは全員閲覧可"
  on public.comments for select using (true);

create policy "ログイン済みユーザーはコメント可"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "自分のコメントは削除可"
  on public.comments for delete using (auth.uid() = user_id);

-- ⑤ favorites テーブル（プレミアム機能）
create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  spot_id uuid references public.spots(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, spot_id)
);

alter table public.favorites enable row level security;

create policy "自分のお気に入りは自分だけ閲覧可"
  on public.favorites for select using (auth.uid() = user_id);

create policy "プレミアムユーザーのみお気に入り登録可"
  on public.favorites for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_premium = true
    )
  );

create policy "自分のお気に入りは削除可"
  on public.favorites for delete using (auth.uid() = user_id);
