import {
  differenceWith,
  equals,
  filter,
  find,
  findIndex,
  includes,
  map,
} from 'ramda';
import jiraAPI from '../lib/jira-api.js';
import getSheet from '../lib/sheets/get-sheet.js';
import { Issue } from '../types.js';

const developmentLoadFilter = `
  status = "In Progress"
  OR status = "In Review"
  OR status = "Merged In Dev"
  OR status = "RFT"
  OR status = "QA In Progress"
  OR status = "QA Failed"
  OR status = "UAT"
  OR status = "RFT - PROD"
  OR status = "RFT - PROD Fail"
  OR status = "Ready for PROD Deploy"
  OR status = "To Do"
`;

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

(async function () {
  const [
    {
      data: { issues: allIssues },
    },
    {
      data: { issues: backlogIssues },
    },
    sheet,
  ] = await Promise.all([
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/issue`,
      params: {
        maxResults: 1000,
        jql: developmentLoadFilter,
      },
    }),
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/backlog`,
      params: {
        maxResults: 1000,
        jql: developmentLoadFilter,
      },
    }),
    getSheet('Current'),
  ]);

  const currentIssues = differenceWith(
    (issueA, issueB) => equals(issueA.key, issueB.key),
    allIssues as Issue[],
    backlogIssues as Issue[],
  );

  const sheetRows = await sheet.getRows();
  await sheet.loadCells();

  const missingCards = filter(
    (issue) =>
      !find(
        (row) =>
          sheet.getCell(row.rowIndex - 1, 0).value ===
          `${process.env.JIRA_URL}/browse/${issue.key}`,
        sheetRows,
      ) && issue.fields.issuetype.name !== 'Epic',
    currentIssues,
  );

  console.log({
    all: allIssues.length,
    backlog: backlogIssues.length,
    current: currentIssues.length,
    missing: missingCards.length,
  });

  const rows = map(
    ({
      key,
      fields: { summary, status, assignee, labels, priority, issuetype },
    }) => [
      `${process.env.JIRA_URL}/browse/${key}`,
      summary,
      status.name,
      issuetype.name,
      priority.name,
      includes('Frontend', labels)
        ? 'FE'
        : includes('Backend', labels)
        ? 'BE'
        : includes('QA', labels)
        ? 'QA'
        : '',
      assignee?.displayName || 'Unassigned',
      findIndex((item: string) => item === status.name, statusOrder),
    ],
    missingCards,
  );

  await sheet.addRows(rows);
})();
