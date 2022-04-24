import { filter } from 'ramda';
import getSheets from '../lib/sheets/get-sheets.js';

(async function () {
  const [currentSheet, doneThisMonthSheet] = await getSheets([
    'Current',
    'Done (This Month)',
  ]);

  await Promise.all([currentSheet.loadCells(), doneThisMonthSheet.loadCells()]);

  const doneRows = filter(
    (row) => currentSheet.getCell(row.rowIndex - 1, 2)?.value === 'Done',
    await currentSheet.getRows(),
  );

  await doneThisMonthSheet.addRows(doneRows);
})();
