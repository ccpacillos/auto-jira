import { addIndex, map } from 'ramda';
import jiraAPI from './lib/jira-api.js';
import { Issue, Status } from './types.js';

function getStatusOrFilter(statuses: Status[]) {
  return statuses.map((status) => `status = "${status}"`).join(' OR ');
}

function toList(cards: Issue[], withStatus = false) {
  return addIndex(map)(
    (issue, index) =>
      `  ${index + 1}. ${(issue as Issue).fields.summary} - ${
        process.env.JIRA_URL
      }/browse/${(issue as Issue).key}${
        withStatus ? ` (${(issue as Issue).fields.status.name})` : ''
      }`,
    cards,
  ).join('\n');
}

(async function (env: 'prod' | 'staging') {
  const {
    data: { issues },
  } = await jiraAPI().request({
    method: 'GET',
    url: `/rest/agile/1.0/board/78/issue`,
    params: {
      maxResults: 1000,
      jql: getStatusOrFilter(
        env === 'prod' ? ['UAT', 'Ready for PROD Deploy'] : ['Merge In Dev'],
      ),
    },
  });

  console.log(toList(issues));
})('prod');
