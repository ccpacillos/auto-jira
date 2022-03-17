import getSheet from './get-sheet.js';

(async function () {
  const sheet = await getSheet();
  const rows = await sheet.getRows();

  rows.map((row) => console.log(row.Card));
})();
