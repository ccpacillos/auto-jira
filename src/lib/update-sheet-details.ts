import Bluebird from 'bluebird';
import { findIndex, includes, map } from 'ramda';
import assertIssueOnBoard from './assert-issue-on-board.js';
import getIssueDetails from './get-issue-details.js';
import getIssueIdFromUrl from './get-issue-id-from-url.js';
import getSheet from './get-sheet.js';
import jiraAPI from './jira-api.js';

export default async function updateSheetDetails(
  title: string,
  assertCardsToBoard = false,
  updateSharedToClient = false,
) {
  console.log(`Updating sheet: ${title}`);
  const sheet = await getSheet(title);
  const rows = await sheet.getRows();
  await sheet.loadCells();

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
    'RFT - PROD',
    'RFT - PROD Fail',
    'Done',
  ];

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
        issueStatusOrder,
      ] = map((column: number) => sheet.getCell(index, column))([
        0, 1, 2, 3, 4, 5, 6, 7,
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
      }

      issueStatusOrder.value = findIndex(
        (item: string) => item === status,
        statusOrder,
      );

      const assigneeDisplayName = assignee?.displayName || 'Unassigned';

      if (issueAssignee.value !== assigneeDisplayName) {
        issueAssignee.value = assigneeDisplayName;
      }

      if (!issueTitle.value) {
        issueTitle.value = title;
      }

      if (!issueDesignation.value) {
        issueDesignation.value = '';
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

      if (assignee?.accountId === '5eb4db627dab3a0bb43ee7e2') {
        try {
          await jiraAPI().request({
            method: 'PUT',
            url: `/rest/api/3/issue/${issueId}`,
            data: {
              fields: {
                assignee: null,
              },
            },
          });
          issueAssignee.value = 'Unassigned';
        } catch (error) {
          console.log((error as any).response);
        }
      }
    },
    { concurrency: 5 },
  );

  await sheet.saveUpdatedCells();
}
