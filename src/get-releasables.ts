import jiraAPI from './lib/jira-api.js';
import { Status } from './types.js';

function getStatusOrFilter(statuses: Status[]) {
  return statuses.map((status) => `status = "${status}"`).join(' OR ');
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

  console.log(issues.length);
})('prod');
