const SHEET_ID = '1rwdpfk-1lRtM2IDq4cH1uynEksKD_OKDIBjedaQ7FgY';
const SHEET_NAME = 'Лист1';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    const data = (e && e.parameter) ? e.parameter : {};
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Не найден лист «' + SHEET_NAME + '»');

    // Дата | Курс | Формат | Имя | Телефон | Telegram / e-mail | Комментарий
    sheet.appendRow([
      new Date(),
      safe_(data.course),
      safe_(data.format),
      safe_(data.name),
      safe_(data.phone),
      safe_(data.contact),
      safe_(data.comment)
    ]);
    SpreadsheetApp.flush();

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        service: 'BADBEE SCHOOL',
        spreadsheet: ss.getName(),
        sheet: sheet.getName(),
        row: sheet.getLastRow()
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(error && error.message ? error.message : error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function doGet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        service: 'BADBEE SCHOOL',
        spreadsheet: ss.getName(),
        sheet: sheet ? sheet.getName() : null,
        lastRow: sheet ? sheet.getLastRow() : null
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false,error:String(error.message || error)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function safe_(value) {
  const text = value == null ? '' : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}
