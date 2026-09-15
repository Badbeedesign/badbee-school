/**
 * BADBEE SCHOOL — анкета предзаписи → Google Sheets
 *
 * 1. Создайте новую Google Таблицу.
 * 2. Расширения → Apps Script.
 * 3. Вставьте этот код вместо Code.gs.
 * 4. В SHEET_ID вставьте ID таблицы из её URL.
 * 5. Развернуть → Новое развертывание → Веб-приложение.
 *    Выполнять от имени: Я.
 *    Доступ: Все / Anyone (вариант названия зависит от аккаунта).
 * 6. Скопируйте URL веб-приложения и вставьте его в config.js сайта.
 */

const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const SHEET_NAME = 'Предзапись';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      safe_(data.course),
      safe_(data.name),
      safe_(data.contact),
      safe_(data.format),
      safe_(data.comment),
      safe_(data.source),
      safe_(data.submittedAt)
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function getSheet_() {
  if (SHEET_ID === 'PASTE_GOOGLE_SHEET_ID_HERE') {
    throw new Error('Укажите SHEET_ID в GoogleAppsScript.gs');
  }

  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Дата отправки',
      'Курс',
      'Имя',
      'Telegram / e-mail',
      'Формат обучения',
      'Комментарий',
      'Страница',
      'Время браузера'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function safe_(value) {
  const text = value == null ? '' : String(value);
  // Защита Google Sheets от формул, введённых пользователем.
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
