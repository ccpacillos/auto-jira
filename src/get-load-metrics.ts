import { differenceWith, equals, groupBy, map, prop, sortBy } from 'ramda';
import jiraAPI from './lib/jira-api.js';
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

(async function getLoadMetrics() {
  const sortByDesignation = sortBy(prop('designation'));
  const developers = sortByDesignation(users);

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

  map((developer: any) => {
    console.log(
      [
        developer.displayName,
        developer.designation,
        issues[developer.accountId]?.length || 0,
      ].join(' '),
    );
  }, developers);
})();
