// テスト用のシンプルなGoogle Apps Script API
// スプレッドシートにメールアドレスを保存する

const SHEET_ID = '1-i9sTk0PXt6RLKFQ64t2vspUnCEE31aGY9QsFSgyicE';
const SHEET_NAME = 'focal-waitlist';

function doPost(e) {
  try {
    console.log('doPost called with:', e);
    
    // Parse the request body
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    
    console.log('Email received:', email);
    
    if (!email) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Email is required' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Invalid email format' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Get the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // Add headers
      sheet.getRange(1, 1, 1, 3).setValues([['Email', 'Timestamp', 'Status']]);
    }
    
    // Check if email already exists
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Skip header row and check for existing email
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] && values[i][0].toLowerCase() === email.toLowerCase()) {
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: true, 
            message: 'Email already registered',
            alreadyRegistered: true 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Add new email to the sheet
    const timestamp = new Date();
    sheet.appendRow([email, timestamp, 'registered']);
    
    console.log('Email added to sheet:', email);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Email registered successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: 'Server error', 
        details: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      message: 'This endpoint only accepts POST requests',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
