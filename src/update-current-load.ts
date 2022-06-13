import Bluebird from 'bluebird';
import { findIndex, map } from 'ramda';
import getIssueDetails from './lib/get-issue-details.js';
import getIssueIdFromUrl from './lib/get-issue-id-from-url.js';
import getSheet from './lib/sheets/get-sheet.js';

const statusOrder = [
  'To Do',
  'In Progress',
  'In Review',
  'Merged In Dev',
  'RFT',
  'QA In Progress',
  'QA Failed',
  'UAT',
  'Ready for PROD Deploy',
  'RFT - PROD Fail',
  'RFT - PROD',
  'Done',
];

(async function () {
  const sheet = await getSheet('Current Load');
  const rows = await sheet.getRows();
  await sheet.loadCells();

  await Bluebird.map(
    rows,
    async (row) => {
      const index = row.rowIndex - 1;
      const [issueLink, issueTitle, issueStatus, , order] = map(
        (column: number) => sheet.getCell(index, column),
      )([0, 1, 2, 3, 4]);

      if (!issueLink.value) return;

      const card = await getIssueDetails(
        getIssueIdFromUrl(issueLink.value.toString()),
      );

      issueTitle.value = card.fields.summary;
      issueStatus.value = card.fields.status.name;

      order.value = findIndex(
        (item: string) => item === card.fields.status.name,
        statusOrder,
      );
    },
    { concurrency: 5 },
  );

  await sheet.saveUpdatedCells();
})();
