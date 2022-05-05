import { differenceWith, equals, groupBy } from 'ramda';
import jiraAPI from '../lib/jira-api.js';
import { toList } from '../lib/jira-cards-to-list.js';
import { Issue } from '../types.js';

(async function () {
  const developmentLoadFilter = `
    status = "UAT"
    OR status = "Ready for PROD Deploy"
    OR status = "RFT - PROD"
    OR status = "RFT"
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

  const currentIssues = differenceWith(
    (issueA: { key: string }, issueB: { key: string }) =>
      equals(issueA.key, issueB.key),
    allIssues,
    backlogIssues,
  ) as Issue[];

  const groups = groupBy((issue) => issue.fields.status.name, currentIssues);

  const markdown = `
RFT - PROD:
${toList(groups['RFT - PROD'] || [])}

UAT
${toList(groups['UAT'] || [])}

In QA:
${toList([
  ...(groups['RFT'] || []),
  ...(groups['QA In Progress'] || []),
  ...(groups['QA Failed'] || []),
  ...(groups['UAT'] || []),
])}

Ready for Release:
${toList(groups['Ready for PROD Deploy'] || [])}
  `;

  console.log(markdown);
})();
