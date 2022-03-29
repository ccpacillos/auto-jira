import Bluebird from 'bluebird';
import { includes, map } from 'ramda';
import assertIssueOnBoard from './assert-issue-on-board.js';
import getIssueDetails from './get-issue-details.js';
import getIssueIdFromUrl from './get-issue-id-from-url.js';
import getSheet from './get-sheet.js';

export default async function updateSheetDetails(
  title: string,
  assertCardsToBoard = false,
  updateSharedToClient = false,
) {
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
        issueType,
        issuePriority,
        issueDesignation,
        issueAssignee,
        shared,
      ] = map((column: number) => sheet.getCell(index, column))([
        0, 1, 2, 3, 4, 5, 6, 8,
      ]);

      if (!issueLink.value) return;

      const issueId = getIssueIdFromUrl(issueLink.value.toString());

      if (!issueId) return;

      const {
        fields: {
          status: { name: status },
          assignee,
          summary: title,
          priority: { name: priority },
          issuetype: { name: type },
          labels,
        },
      } = await getIssueDetails(issueId);

      console.log(`Checking issue: ${issueId}`);

      if (issueStatus.value !== status) {
        issueStatus.value = status;
        if (status === 'RFT - PROD' && updateSharedToClient) {
          shared.value = 'No';
        }
      }

      const assigneeDisplayName = assignee?.displayName || 'Unassigned';

      if (issueAssignee.value !== assigneeDisplayName) {
        issueAssignee.value = assigneeDisplayName;
      }

      if (!issueTitle.value) {
        issueTitle.value = title;
      }

      if (!issueDesignation.value) {
        if (includes('Frontend', labels)) {
          issueDesignation.value = 'FE';
        }

        if (includes('Backend', labels)) {
          issueDesignation.value = 'BE';
        }

        if (includes('QA', labels)) {
          issueDesignation.value = 'QA';
        }
      }

      if (issuePriority.value !== priority) {
        issuePriority.value = priority;
      }

      if (issueType.value !== type) {
        issueType.value = type;
      }

      if (assertCardsToBoard) {
        await assertIssueOnBoard(issueId);
      }
    },
    { concurrency: 10 },
  );

  await sheet.saveUpdatedCells();
}
