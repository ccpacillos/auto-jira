import Bluebird from 'bluebird';
import { map } from 'ramda';
import getDesignation from './get-designation.js';
import getIssueDetails from './get-issue-details.js';
import getSheet from './get-sheet.js';

export default async function updateSheet(title: string) {
  console.log(`Updating sheet: ${title}`);
  const sheet = await getSheet(title);
  await sheet.loadCells();
  const rows = await sheet.getRows();

  await Bluebird.map(
    rows,
    async (row) => {
      const index = row.rowIndex - 1;
      const [
        issueLink,
        issueTitle,
        issueStatus,
        issueAssignee,
        issueDesignation,
      ] = map((column: number) => sheet.getCell(index, column))([
        0, 1, 2, 3, 4,
      ]);

      if (!issueLink.value) return;

      const regex = new RegExp(/^https.*\/(EU-.*)$/);
      const [, issueId] = (issueLink.value as string).match(regex) || [];

      if (!issueId) return;

      const {
        fields: {
          status: { name: status },
          assignee: { displayName: assignee, accountId },
          summary: title,
        },
      } = await getIssueDetails(issueId);

      console.log(`Checking issue: ${issueId}`);

      if (issueStatus.value !== status) {
        issueStatus.value = status;
      }

      if (issueAssignee.value !== assignee) {
        issueAssignee.value = assignee;
      }

      if (!issueTitle.value) {
        issueTitle.value = title;
      }

      if (!issueDesignation.value) {
        issueDesignation.value = getDesignation(accountId) || '';
      }

      await sheet.saveUpdatedCells();
    },
    { concurrency: 5 },
  );
}
