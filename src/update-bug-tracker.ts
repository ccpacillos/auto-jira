import Bluebird from 'bluebird';
import { map } from 'ramda';
import getIssueDetails from './lib/get-issue-details.js';
import getIssueIdFromUrl from './lib/get-issue-id-from-url.js';
import getSheet from './lib/sheets/get-sheet.js';

(async function () {
  const sheet = await getSheet('Bug Tracker');
  const rows = await sheet.getRows();
  await sheet.loadCells();

  await Bluebird.map(
    rows,
    async (row) => {
      const index = row.rowIndex - 1;
      const [issueLink, , status] = map((column: number) =>
        sheet.getCell(index, column),
      )([0, 1, 2, 3]);

      try {
        const issue = await getIssueDetails(
          getIssueIdFromUrl(issueLink.value.toString()),
        );
        status.value = issue.fields.status.name;
      } catch (error) {
        console.log(`Some error with: ${issueLink.value}`);
      }
    },
    { concurrency: 5 },
  );

  await sheet.saveUpdatedCells();
})();
