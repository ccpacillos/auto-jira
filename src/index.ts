import getSheet from './get-sheet.js';

(async function () {
  const sheet = await getSheet();
  const rows = await sheet.getRows();

  await sheet.loadCells();

  rows.map((row) => {
    const cell = sheet.getCell(row.rowIndex, 2);
    console.log(cell.value);
  });
})();
