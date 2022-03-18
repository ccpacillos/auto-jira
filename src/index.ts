import Bluebird from 'bluebird';
import getIssueDetails from './get-issue-details.js';
import getSheet from './get-sheet.js';

(async function () {
  const sheet = await getSheet();
  const rows = await sheet.getRows();

  await sheet.loadCells();

  await Bluebird.map(
    rows,
    async (row) => {
      const [issueLink, issueStatus, issueAssignee] = [
        sheet.getCell(row.rowIndex, 0),
        sheet.getCell(row.rowIndex, 2),
        sheet.getCell(row.rowIndex, 3),
      ];

      if (!issueLink.value) return;

      const regex = new RegExp(/^https.*\/(EU-.*)$/);
      const [, issueId] = (issueLink.value as string).match(regex) || [];

      if (!issueId) return;

      const {
        fields: {
          status: { name: status },
          assignee: { displayName: assignee },
        },
      } = await getIssueDetails(issueId);

      if (issueStatus.value !== status && issueAssignee.value !== assignee) {
        console.log(`Found issue to be updated: ${issueId}`);
        issueStatus.value = status;
        issueAssignee.value = assignee;
      }
    },
    { concurrency: 5 },
  );

  await sheet.saveUpdatedCells();
  console.log('All issues have been updated.');
})();
