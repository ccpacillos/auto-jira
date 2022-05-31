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
  const sheet = await getSheet('Weekly Targets');
  const rows = await sheet.getRows();
  await sheet.loadCells();

  await Bluebird.map(
    rows,
    async (row) => {
      const index = row.rowIndex - 1;
      const [issueLink, issueTitle, issueEpic, issueStatus, order] = map(
        (column: number) => sheet.getCell(index, column),
      )([1, 2, 3, 4, 5]);

      if (!issueLink.value) return;

      const card = await getIssueDetails(
        getIssueIdFromUrl(issueLink.value.toString()),
      );

      issueTitle.value = card.fields.summary;

      if (card.fields.parent) {
        const epic = await getIssueDetails(card.fields.parent.key);

        issueEpic.value = epic.fields.summary;
      }

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
