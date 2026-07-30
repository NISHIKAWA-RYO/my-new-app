# Campus Trade ルーティング設計

## 目的

React 実装前に URL 構成とルートの責務を固定し、認証・取引・公開ページの境界を明確にする。

## ルート設計方針

- 公開ページと認証必須ページを分離する
- 取引関連はすべて保護ルート配下に置く
- 一覧・詳細・作成・編集を同じリソース階層でまとめる
- 404 と権限エラーの表示先をあらかじめ決める
- 画面遷移は URL で追えるようにする

## URL 構成

### 公開ページ

- `/` ホーム
- `/textbooks` 教科書一覧・検索結果
- `/textbooks/:id` 教科書詳細
- `/users/:id` 公開プロフィール
- `/auth/login` ログイン
- `/auth/register` 新規登録
- `/auth/verify-email` メール認証
- `/auth/forgot-password` パスワード再設定申請
- `/auth/reset-password` パスワード再設定

### 認証必須ページ

- `/me` マイページ
- `/me/edit` プロフィール編集
- `/me/settings` 設定
- `/me/favorites` お気に入り一覧
- `/me/history` 閲覧履歴
- `/me/blocks` ブロック一覧
- `/me/transactions` 取引一覧
- `/me/reviews` 自分のレビュー一覧
- `/textbooks/new` 出品作成
- `/textbooks/:id/edit` 出品編集
- `/transactions/:id` 取引詳細
- `/transactions/:id/chat` チャット
- `/transactions/:id/meeting` 待ち合わせ設定
- `/transactions/:id/review` レビュー投稿
- `/reports/new` 通報作成

### 補助ページ

- `/404` 見つからないページ
- `/403` 権限なしページ
- `/500` サーバーエラーページ

## ルートグループ

```text
/
├── auth
│   ├── login
│   ├── register
│   ├── verify-email
│   ├── forgot-password
│   └── reset-password
├── textbooks
│   ├── new
│   ├── :id
│   │   └── edit
├── transactions
│   ├── :id
│   │   ├── chat
│   │   ├── meeting
│   │   └── review
├── users
│   └── :id
└── me
    ├── edit
    ├── settings
    ├── favorites
    ├── history
    ├── blocks
    ├── transactions
    └── reviews
```

## 画面ごとの責務

### `/`

- デフォルトのホーム一覧を表示する
- 検索バー、ソート、注目商品、学部別導線を置く
- 未ログインでも閲覧できる

### `/textbooks`

- キーワード検索と詳細検索の結果を表示する
- クエリパラメータで検索条件を保持する
- 例: `?q=経済学&sort=newest&facultyId=...`

### `/textbooks/:id`

- 商品詳細、画像、公開コメント、出品者情報を表示する
- 固定価格なら「連絡する」ボタンを出す
- オークションなら入札 UI を出す
- 編集・削除は出品者のみ

### `/textbooks/new`

- 出品フォーム
- 固定価格 / オークションの切り替え
- 画像アップロード

### `/textbooks/:id/edit`

- LISTED のみ編集可能
- 状態により閲覧専用へ切り替える

### `/transactions/:id`

- 取引の進行状況を確認する
- チャット、待ち合わせ、お釣りなし合意、完了状態をまとめる
- buyer / seller のみアクセス可

### `/transactions/:id/chat`

- 取引相手とのやり取り専用
- 取引詳細から内部タブ遷移する想定

### `/transactions/:id/meeting`

- 安全スポット選択
- 待ち合わせ日時の設定

### `/transactions/:id/review`

- 完了後レビューを投稿する
- 1 取引につき 1 回のみ

### `/me`

- プロフィール概要
- 出品数、お気に入り、取引中、レビュー評価をまとめる

### `/me/settings`

- 言語、テーマ、パスワード変更
- 再認証が必要ならここで誘導する

## 認証ガード

### 公開ルート

- 未ログインでも表示可能
- ただしログイン済みならセッション情報を使って表示を最適化する

### 保護ルート

- セッション未認証なら `/auth/login` にリダイレクト
- `requiresReauth = true` の場合は `/auth/login?reauth=1` に誘導する
- ブロックや権限不足は `/403` に送る

### 出品者専用ルート

- `textbooks/:id/edit` は seller のみ
- 取引・レビュー・チャットは transaction の buyer / seller のみ

## UI 構成の考え方

- 上部に共通ヘッダー
- 検索系ページはフィルターを左、一覧を右に置く
- 詳細ページは画像、価格、メタ情報、行動ボタン、コメントの順で配置する
- 取引系は縦長で、進行ステップが見える表示にする

## クエリパラメータの使い方

### `textbooks`

- `q`
- `isbn`
- `lectureName`
- `facultyId`
- `author`
- `publisher`
- `condition`
- `saleFormat`
- `sort`
- `page`
- `limit`

### `auth/login`

- `reauth=1` 長期未ログインの再認証
- `redirect=/transactions/...` ログイン後の戻り先

## 画面遷移の基本ルール

- 出品作成成功後は `/textbooks/:id` に遷移する
- 取引開始成功後は `/transactions/:id` に遷移する
- 入札成功後は同じ詳細画面に戻し、更新された価格を表示する
- レビュー投稿後は `/transactions/:id` または `/me/reviews` に戻す
- 404 は存在しない ID でも共通表示を使う

## Phase 別実装順

### Phase 1

- `/auth/login`
- `/auth/register`
- `/auth/verify-email`
- `/`
- `/textbooks`
- `/textbooks/:id`
- `/textbooks/new`
- `/transactions/:id`
- `/transactions/:id/chat`
- `/me`
- `/me/transactions`

### Phase 2

- `/me/favorites`
- `/me/history`
- `/transactions/:id/meeting`
- `/transactions/:id/review`
- `/me/settings`
- `/me/blocks`

### Phase 3

- `/reports/new`
- `/textbooks/:id/edit`
- `/users/:id`
- 403 / 500 ページ

## 実装メモ

- React Router か同等のルーティング層で実装する
- 認証状態は共通レイアウトで判定する
- 取引詳細は nested route にするとタブ UI と相性が良い
- 検索一覧は URL クエリを state の唯一のソースにする
