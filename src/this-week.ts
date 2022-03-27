import { map } from 'ramda';
import getSheet from './lib/get-sheet.js';

(async function () {
  const sheet = await getSheet('This Week');
  const rows = await sheet.getRows();
  await sheet.loadCells();

  console.log(map((row) => sheet.getCell(row.rowIndex - 1, 2).value, rows));
})();