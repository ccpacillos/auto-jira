import { differenceWith, equals } from 'ramda';
import jiraAPI from './lib/jira-api.js';
import getSheet from './lib/sheets/get-sheet.js';
import { Issue } from './types.js';

export default async function getCardsOnBoard() {
  const jql = `
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
    and type != "Epic"
  `;

  const [
    {
      data: { issues: allIssues },
    },
    {
      data: { issues: backlogIssues },
    },
  ] = await Promise.all([
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/issue`,
      params: {
        maxResults: 1000,
        jql,
      },
    }),
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/backlog`,
      params: {
        maxResults: 1000,
        jql,
      },
    }),
    getSheet('Current'),
  ]);

  return differenceWith(
    (issueA: { key: string }, issueB: { key: string }) =>
      equals(issueA.key, issueB.key),
    allIssues,
    backlogIssues,
  ) as Issue[];
}
