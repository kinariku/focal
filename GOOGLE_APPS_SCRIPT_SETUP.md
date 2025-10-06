# Google Apps Script セットアップ手順

## 1. Googleスプレッドシートの準備

1. [Google Sheets](https://sheets.google.com)にアクセス
2. 新しいスプレッドシートを作成
3. スプレッドシートの名前を「Focal Waitlist」に変更
4. 以下のヘッダーを設定：
   - A1セル: `Email`
   - B1セル: `Timestamp`
5. スプレッドシートのURLをコピー（例：`https://docs.google.com/spreadsheets/d/1ABC123DEF456GHI789JKL/edit`）
6. URLの`/d/`と`/edit`の間の文字列（例：`1ABC123DEF456GHI789JKL`）をコピー

## 2. Google Apps Scriptの設定

1. [Google Apps Script](https://script.google.com)にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「Focal Waitlist API」に変更
4. `Code.gs`ファイルの内容を削除
5. `api/waitlist.js`の内容をコピーして貼り付け
6. 以下の部分を修正：
   ```javascript
   // この行を
   const spreadsheetId = 'YOUR_SPREADSHEET_ID';
   // 実際のスプレッドシートIDに変更
   const spreadsheetId = '1ABC123DEF456GHI789JKL'; // 例
   ```

## 3. デプロイの設定

1. 右上の「デプロイ」ボタンをクリック
2. 「新しいデプロイ」を選択
3. 歯車アイコンをクリックして「ウェブアプリ」を選択
4. 以下の設定を行う：
   - **説明**: `Focal Waitlist API`
   - **実行ユーザー**: `自分`
   - **アクセス権限**: `すべてのユーザー`
5. 「デプロイ」をクリック
6. 初回デプロイ時は認証が必要：
   - 「権限を確認」をクリック
   - Googleアカウントを選択
   - 「詳細」→「Focal Waitlist API（安全ではないページ）に移動」をクリック
   - 「許可」をクリック
7. デプロイが完了したら、ウェブアプリのURLをコピー

## 4. HTMLファイルの更新

1. `index.html`を開く
2. 以下の行を探す：
   ```javascript
   const scriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
   ```
3. 実際のGoogle Apps ScriptのURLに置き換える：
   ```javascript
   const scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```

## 5. テスト

1. ブラウザでページを開く
2. メールアドレスを入力して「早期アクセス」をクリック
3. 成功メッセージが表示されることを確認
4. Googleスプレッドシートにメールアドレスが追加されることを確認
5. 同じメールアドレスで再度登録を試行し、重複チェックが機能することを確認

## トラブルシューティング

### エラー: "501 Unsupported method"
- Google Apps ScriptのURLが正しく設定されていない
- デプロイ設定で「すべてのユーザー」が選択されていない

### エラー: "CORS error"
- Google Apps Scriptのデプロイ設定を確認
- アクセス権限が「すべてのユーザー」になっているか確認

### エラー: "Script not found"
- デプロイが完了しているか確認
- URLが正しくコピーされているか確認

## セキュリティ注意事項

- このAPIは公開されているため、適切なアクセス制御を設定してください
- 本番環境では、より堅牢なバックエンドAPIの使用を検討してください
- スプレッドシートのアクセス権限を適切に設定してください
