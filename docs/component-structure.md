# Campus Trade コンポーネント分割案

## 目的

React 実装時に、どの部品を共通化し、どの部品を各ページに閉じ込めるかを先に決める。

## 分割方針

- 共通レイアウトは最小限にする
- カード、フォーム、ボタン、モーダル、タブは再利用しやすい単位で分ける
- 画面固有の状態はページコンポーネント側に置く
- 取引系は UI を共通化しつつ、状態表示だけ差し替える
- 検索一覧はカードとフィルタの再利用を前提にする

## ルートレイアウト

### `AppLayout`

- ヘッダー、フッター、コンテンツ枠を持つ
- ログイン状態でヘッダーの表示を切り替える

### `AuthLayout`

- ログイン・登録・認証画面専用
- 余計なナビゲーションを出さない

### `TransactionLayout`

- 取引画面専用の縦長レイアウト
- 進行ステップ、相手情報、主要アクションをまとめる

## 共通コンポーネント

### ナビゲーション

- `Header`
- `MobileNav`
- `SideMenu`
- `Breadcrumbs`

### 表示系

- `TextbookCard`
- `TextbookImageGallery`
- `UserAvatar`
- `RatingStars`
- `StatusBadge`
- `ConditionBadge`
- `PriceLabel`
- `TagList`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`

### 入力系

- `SearchBar`
- `SortSelect`
- `FilterPanel`
- `TextInput`
- `PasswordInput`
- `TextArea`
- `SelectBox`
- `Checkbox`
- `ToggleSwitch`
- `DateTimePicker`
- `FileUploader`

### 操作系

- `PrimaryButton`
- `SecondaryButton`
- `DangerButton`
- `IconButton`
- `Modal`
- `ConfirmDialog`
- `TabList`
- `TabPanel`
- `Pagination`

### 取引系

- `TransactionStepIndicator`
- `TransactionSummaryCard`
- `ChatMessageItem`
- `ChatComposer`
- `MeetingSpotSelector`
- `NoChangeAgreementCard`
- `ReviewForm`
- `ReportForm`
- `BlockListItem`

## ページごとの構成

### ホーム画面

- `Header`
- `SearchBar`
- `SortSelect`
- `TextbookCard`
- `Pagination`
- `EmptyState`

### 教科書一覧画面

- `FilterPanel`
- `SearchBar`
- `SortSelect`
- `TextbookCard`
- `Pagination`

### 教科書詳細画面

- `TextbookImageGallery`
- `PriceLabel`
- `StatusBadge`
- `ConditionBadge`
- `TagList`
- `PrimaryButton`
- `SecondaryButton`
- `TabList`
- `TabPanel`
- `TextArea`
- `ListingComment` 系の表示行

### 出品作成・編集画面

- `TextInput`
- `TextArea`
- `SelectBox`
- `DateTimePicker`
- `FileUploader`
- `ToggleSwitch`
- `PrimaryButton`
- `ConfirmDialog`

### 取引詳細画面

- `TransactionStepIndicator`
- `TransactionSummaryCard`
- `ChatMessageItem`
- `ChatComposer`
- `MeetingSpotSelector`
- `NoChangeAgreementCard`
- `ReviewForm`
- `PrimaryButton`

### マイページ

- `UserAvatar`
- `RatingStars`
- `StatusBadge`
- `TextbookCard`
- `TransactionSummaryCard`
- `Pagination`

## コンポーネント階層の考え方

### 1. atoms

- ボタン
- 入力欄
- バッジ
- アイコン
- ラベル

### 2. molecules

- 検索バー
- カード
- コメント行
- チャット吹き出し
- 評価表示

### 3. organisms

- ヘッダー
- フィルタパネル
- 商品一覧
- 取引パネル
- 出品フォーム

### 4. pages

- 画面単位のデータ取得とルーティング制御
- API から取った値を organisms に渡す

## 実装上の役割分担

### ページ側が持つもの

- API 呼び出し
- URL クエリの状態
- フォーム送信処理
- 認証ガード
- エラー表示の切り替え

### 共通部品が持つもの

- 見た目
- 最小限の入力制御
- 表示の切り替え
- ローディング表示

## データの流れ

- ページが API からデータを取る
- ページが整形して共通コンポーネントに渡す
- 共通コンポーネントは表示に専念する
- フォーム系は `value` と `onChange` を受け取る

## 画面別の推奨分割

### 認証画面

- フォーム本体
- 入力欄
- エラー表示
- 送信ボタン

### 一覧画面

- 検索バー
- フィルタパネル
- 並び替え
- 商品カード一覧
- ページネーション

### 詳細画面

- 商品ヘッダー
- 画像ギャラリー
- 出品者情報
- 公開コメント
- 取引導線

### 取引画面

- 進行ステップ
- 取引要約
- チャット
- 待ち合わせ
- 合意確認
- 完了・レビュー

## 再利用の優先順位

1. `TextbookCard`
2. `StatusBadge`
3. `PriceLabel`
4. `UserAvatar`
5. `PrimaryButton`
6. `TextInput`
7. `Pagination`
8. `TransactionSummaryCard`

## 実装メモ

- 最初は共通 UI を増やしすぎない
- 画面単位で必要なものだけ作る
- 取引系は後から機能が増えやすいので、最初から分割を細かめにしておく
- 画像アップロードは別サービス連携を前提に、UI だけ先に切り出す
