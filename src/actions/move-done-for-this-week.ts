import Bluebird from 'bluebird';
import getIssueIdFromUrl from '../lib/get-issue-id-from-url.js';
import getSheet from '../lib/get-sheet.js';

(async function () {
  console.log('Moving Done issues.');
  const thisWeekSheet = await getSheet('This Week');
  const doneForThisWeekSheet = await getSheet('Done For This Week');

  await thisWeekSheet.loadCells();
  const rows = await thisWeekSheet.getRows();

  await Bluebird.map(rows, async (row) => {
    const status = thisWeekSheet.getCell(row.rowIndex - 1, 2);
    const issueId = thisWeekSheet.getCell(row.rowIndex - 1, 0);

    if (!issueId.value) return;

    if (status.value && status.value.toString().toLowerCase() === 'done') {
      console.log(
        `Moving Done card: ${getIssueIdFromUrl(issueId.value.toString())}`,
      );
      await doneForThisWeekSheet.addRow(row);
      await row.delete();
    }
  });
})();
