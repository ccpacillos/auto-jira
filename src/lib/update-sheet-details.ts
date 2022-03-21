import Bluebird from 'bluebird';
import { map } from 'ramda';
import assertIssueOnBoard from './assert-issue-on-board.js';
import getDesignation from './get-designation.js';
import getIssueDetails from './get-issue-details.js';
import getIssueIdFromUrl from './get-issue-id-from-url.js';
import getSheet from './get-sheet.js';

export default async function updateSheetDetails(title: string) {
  console.log(`Updating sheet: ${title}`);
  const sheet = await getSheet(title);
  const rows = await sheet.getRows();
  await sheet.loadCells();

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
        issuePriority,
      ] = map((column: number) => sheet.getCell(index, column))([
        0, 1, 2, 3, 4, 5,
      ]);

      if (!issueLink.value) return;

      const issueId = getIssueIdFromUrl(issueLink.value.toString());

      if (!issueId) return;

      const {
        fields: {
          status: { name: status },
          assignee: { displayName: assignee, accountId },
          summary: title,
          priority: { name: priority },
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

      if (issuePriority.value !== priority) {
        issuePriority.value = priority;
      }

      await assertIssueOnBoard(issueId);
    },
    { concurrency: 5 },
  );

  await sheet.saveUpdatedCells();
}
