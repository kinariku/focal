/***** CONFIG *****/
const SHEET_ID   = '1G9H2dISyHcSJN5TJgX_EagUL8VG4I0yamXG1dV6vR-U';
const SHEET_NAME = 'focal-waitlist';
// シンプルなウェイトリスト用
const HEADERS    = ['email','name','app','created_at','updated_at'];

const JSON_MIME = ContentService.MimeType.JSON;
function json(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(JSON_MIME); }
function nowIso(){ return new Date().toISOString(); }

/***** PROPERTIES HELPERS *****/
function prop_(k, fallback){
  const v = PropertiesService.getScriptProperties().getProperty(k);
  return (v && String(v).trim()) || fallback;
}

// フォールバック（未設定でも動くように一応残す）
const DEFAULT_REDIRECT_BASE = 'https://focal.kinari.app/';
const DEFAULT_WEBAPP_URL    = 'https://script.google.com/macros/s/AKfycbwoXcUShfKMddlnRaPiXFsCisFTsWtKgqiHPmIZ5QdWJyTAMyRtLTkdCd8LYr80qmSogg/exec';

// プロパティ優先で読む
const REDIRECT_BASE = prop_('REDIRECT_BASE', DEFAULT_REDIRECT_BASE);
const WEBAPP_URL    = prop_('WEBAPP_URL',    DEFAULT_WEBAPP_URL);

const REDIRECTS = {
  confirmed: REDIRECT_BASE + (REDIRECT_BASE.includes('?') ? '&' : '?') + 'flow=confirmed',
  invalid:   REDIRECT_BASE + (REDIRECT_BASE.includes('?') ? '&' : '?') + 'flow=invalid',
  expired:   REDIRECT_BASE + (REDIRECT_BASE.includes('?') ? '&' : '?') + 'flow=expired'
};

/***** SHEET HELPERS *****/
function ensureSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  const row = sheet.getRange(1,1,1,HEADERS.length).getValues()[0] || [];
  const ok = HEADERS.every((h,i)=> (row[i]+'').trim() === h);
  if (!ok) sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
  return sheet;
}

// トークン生成機能は削除（シンプルなウェイトリストのみ）

// メール送信機能は削除（シンプルなウェイトリストのみ）

/***** HELPERS *****/
function getCols_(header){ const col = k => header.indexOf(k)+1;
  return {
    email: col('email'),
    name: col('name'),
    app: col('app'),
    createdAt: col('created_at'),
    updatedAt: col('updated_at'),
  };
}

// メール確認機能は削除（シンプルなウェイトリストのみ）

/***** GET: ヘルスチェック *****/
function doGet(e){
  return json({ 
    ok: true, 
    message: 'Focal Waitlist API is running',
    timestamp: nowIso()
  });
}

/***** POST router *****/
function doPost(e){
  try{
    if (!e || !e.postData || !e.postData.contents) return json({ ok:false, error:'No payload' });
    const body = JSON.parse(e.postData.contents || '{}');
    Logger.log('doPost body=%s', e.postData.contents);

    return handleWaitlist_(body);
  }catch(err){
    Logger.log('doPost error=%s', err);
    return json({ ok:false, error:String(err) });
  }
}

/***** HANDLERS *****/
function handleWaitlist_(body){
  const email = (body.email || '').trim().toLowerCase();
  const name  = (body.name  || '').trim();
  const app   = (body.app   || 'focal').trim(); // デフォルトはfocal
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok:false, error:'Invalid email' });

  const sheet = ensureSheet();
  const values = sheet.getDataRange().getValues();
  const header = values.shift(); const C = getCols_(header);

  // 既存検索（同じアプリ内での重複チェック）
  let row = -1;
  for (let i=0;i<values.length;i++){
    const rowEmail = (values[i][C.email-1]+'').toLowerCase();
    const rowApp = (values[i][C.app-1]+'').trim();
    if (rowEmail === email && rowApp === app) { row = i+2; break; }
  }

  if (row > -1) {
    // 既存の場合は更新日時のみ更新
    sheet.getRange(row, C.updatedAt).setValue(nowIso());
    return json({ ok:true, message: 'Email already registered' });
  } else {
    // 新規登録
    sheet.appendRow([email, name, app, nowIso(), nowIso()]);
    return json({ ok:true, message: 'Email registered successfully' });
  }
}

// 不要な関数は削除（シンプルなウェイトリストのみ）
