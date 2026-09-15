const SHEET_ID = '1rwdpfk-1lRtM2IDq4cH1uynEksKD_OKDIBjedaQ7FgY';
const SHEET_NAME = 'Лист1';

function doPost(e) {
  try {
    let data = {};
    const raw = e && e.postData ? (e.postData.contents || '') : '';
    if (raw) {
      try { data = JSON.parse(raw); }
      catch (_) { data = e.parameter || {}; }
    } else {
      data = (e && e.parameter) || {};
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Не найден лист «' + SHEET_NAME + '»');

    // Таблица пользователя: Дата | Курс | Формат | Имя | Телефон | Telegram / e-mail | Комментарий
    sheet.appendRow([
      new Date(),
      safe_(data.course),
      safe_(data.format),
      safe_(data.name),
      safe_(data.phone),
      safe_(data.contact),
      safe_(data.comment)
    ]);

    return json_({ok:true, service:'BADBEE SCHOOL', spreadsheet:ss.getName(), sheet:sheet.getName()});
  } catch (error) {
    return json_({ok:false, error:String(error && error.message ? error.message : error)});
  }
}

function doGet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    return json_({ok:true, service:'BADBEE SCHOOL', spreadsheet:ss.getName(), sheet:sheet ? sheet.getName() : null});
  } catch (error) {
    return json_({ok:false, error:String(error && error.message ? error.message : error)});
  }
}

function safe_(value) {
  const text = value == null ? '' : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
