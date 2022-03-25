import { GoogleSpreadsheetRow } from 'google-spreadsheet';
import { filter } from 'ramda';
import getSheet from '../lib/get-sheet.js';

(async function () {
  const sheet = await getSheet('This Week');
  await sheet.loadCells();
  const releasedRows = filter((row: GoogleSpreadsheetRow) => {
    return sheet.getCell(row.rowIndex - 1, 8).value === 'No';
  })(await sheet.getRows());

  console.log(releasedRows);
})();
