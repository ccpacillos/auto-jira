import { GoogleSpreadsheetRow } from 'google-spreadsheet';
import {
  addIndex,
  differenceWith,
  equals,
  groupBy,
  map,
  prop,
  sortBy,
} from 'ramda';
import jiraAPI from './lib/jira-api.js';
import getSheet from './lib/sheets/get-sheet.js';
import { Issue } from './types.js';
import users from './users.js';

const developmentLoadFilter = `
  status = "In Progress"
  OR status = "In Review"
  OR status = "Merged In Dev"
  OR status = "RFT"
  OR status = "QA In Progress"
  OR status = "QA Failed"
  OR status = "RFT - PROD Fail"
  OR status = "To Do"
`;

(async function () {
  const sortByDesignation = sortBy(prop('designation'));
  const developers = sortByDesignation(users);

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
    getSheet('Stats (Current)'),
  ]);

  const issues = groupBy(
    ({ fields }) => fields.assignee?.accountId || 'none',
    differenceWith(
      (issueA: { key: string }, issueB: { key: string }) =>
        equals(issueA.key, issueB.key),
      allIssues,
      backlogIssues,
    ) as Issue[],
  );

  await sheet.loadCells();

  const mapIndexed = addIndex(map);

  mapIndexed((developer: any, index) => {
    const [developerCell, roleCell, activeCardsCell] = map(
      (column) => sheet.getCell(index + 1, column),
      [3, 4, 5],
    );

    developerCell.value = developer.displayName;
    roleCell.value = developer.designation;
    activeCardsCell.value = issues[developer.accountId]?.length || 0;
  }, developers);

  await sheet.saveUpdatedCells();
})();
