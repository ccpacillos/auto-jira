import { concat, differenceWith, equals, groupBy } from 'ramda';
import jiraAPI from '../lib/jira-api.js';
import { toList } from '../lib/jira-cards-to-list.js';
import { Issue } from '../types';

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

(async function () {
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
  let inDev = concat(groups['In Progress'] || [], groups['In Review'] || []);
  inDev = concat(inDev, groups['Merged In Dev'] || []);
  inDev = concat(inDev, groups['RFT'] || []);
  inDev = concat(inDev, groups['QA In Progress'] || []);
  inDev = concat(inDev, groups['QA Failed'] || []);
  inDev = concat(inDev, groups['RFT - PROD Fail'] || []);

  const forRelease = concat(
    groups['UAT'] || [],
    groups['Ready for PROD Deploy'] || [],
  );

  const markdown = `
To Do
${toList(groups['To Do'])}

In Development
${toList(inDev, true)}

For Release
${toList(forRelease, true)}

RFT - PROD
${toList(groups['RFT - PROD'])}
  `;

  console.log(markdown);
})();
