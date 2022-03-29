import { differenceWith, equals, includes, map } from 'ramda';
import getSheet from './lib/get-sheet.js';
import jiraAPI from './lib/jira-api.js';

const developmentLoadFilter = `
  status = "In Progress"
  OR status = "In Review"
  OR status = "Merge In Dev"
  OR status = "RFT"
  OR status = "QA In Progress"
  OR status = "QA Failed"
  OR status = "UAT"
  OR status = "RFT - PROD"
  OR status = "RFT - PROD Fail"
  OR status = "Ready for PROD Deploy"
  OR status = "To Do"
`;

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
    getSheet('This Week'),
  ]);

  const currentIssues = differenceWith(
    (issueA: { key: string }, issueB: { key: string }) =>
      equals(issueA.key, issueB.key),
    allIssues,
    backlogIssues,
  );

  console.log({
    all: allIssues.length,
    backlog: backlogIssues.length,
    current: currentIssues.length,
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
    ],
    currentIssues as {
      key: string;
      fields: {
        summary: string;
        status: {
          name: string;
        };
        assignee: { displayName: string } | null;
        labels: string[];
        priority: {
          name: string;
        };
        issuetype: {
          name: string;
        };
      };
    }[],
  );

  await sheet.addRows(rows);
})();