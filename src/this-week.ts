import { map } from 'ramda';
import getSheet from './lib/sheets/get-sheet.js';

(async function () {
  const sheet = await getSheet('Current');
  const rows = await sheet.getRows();
  await sheet.loadCells();

  console.log(map((row) => sheet.getCell(row.rowIndex - 1, 2).value, rows));
})();
