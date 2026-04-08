# 猫マップ — セットアップ手順

## 1. プロジェクトのセットアップ

```bash
# 依存パッケージをインストール
npm install

# 環境変数ファイルを作成
cp .env.local.example .env.local
```

## 2. Supabase の設定

1. https://supabase.com で新規プロジェクト作成
2. `supabase/migration.sql` の内容を **SQL Editor** に貼り付けて実行
3. **Project Settings > API** から URL と anon key をコピー
4. `.env.local` に貼り付け

## 3. Stripe の設定

1. https://stripe.com でアカウント作成
2. **商品** から月額500円のサブスクリプション商品を作成
3. その **Price ID**（`price_...`）をコピー
4. **開発者 > APIキー** から公開可能キー・シークレットキーをコピー
5. `.env.local` に貼り付け

### Webhook の設定（本番デプロイ後）
```
Stripe ダッシュボード > 開発者 > Webhook > エンドポイントを追加
URL: https://あなたのドメイン.vercel.app/api/stripe/webhook
イベント: checkout.session.completed, customer.subscription.deleted
```

## 4. 開発サーバー起動

```bash
npm run dev
# http://localhost:3000 で確認
```

## 5. Vercel へデプロイ

```bash
# GitHubにプッシュ
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/あなた/neko-map.git
git push -u origin main
```

その後 https://vercel.com でリポジトリを接続し、環境変数を設定するだけで自動デプロイされます。

---

## Cursor でのカスタマイズ指示例

このファイルを Cursor に読み込んで、以下のような指示を出すと仕上げができます：

- 「ログインページを作って（Supabase Auth のメール認証）」
- 「ヘッダーにログイン/ログアウトボタンを追加して」
- 「プレミアムページに成功・キャンセルのメッセージを表示して」
- 「猫の写真をSupabase Storageにアップロードする機能を追加して」
- 「地図の現在地ボタンを追加して」

## ファイル構成

```
neko-map/
├── app/
│   ├── layout.tsx          # ヘッダー込みの共通レイアウト
│   ├── page.tsx            # トップ（地図メイン）
│   ├── spots/new/page.tsx  # スポット登録
│   ├── premium/page.tsx    # プレミアム案内・課金
│   └── api/stripe/
│       ├── checkout/route.ts  # 決済セッション作成
│       └── webhook/route.ts   # 支払い完了処理
├── components/
│   ├── MapView.tsx         # Leaflet 地図
│   ├── SpotModal.tsx       # スポット詳細
│   └── CommentForm.tsx     # コメント投稿
├── lib/
│   ├── supabase.ts         # Supabase クライアント
│   └── stripe.ts           # Stripe クライアント
├── types/index.ts          # 型定義
└── supabase/migration.sql  # DBテーブル作成SQL
```
