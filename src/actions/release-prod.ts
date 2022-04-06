import Bluebird from 'bluebird';
import { groupBy } from 'ramda';
import jiraAPI from '../lib/jira-api.js';
import { Issue, Status } from '../types.js';

function getStatusOrFilter(statuses: Status[]) {
  return statuses.map((status) => `status = "${status}"`).join(' OR ');
}

(async function () {
  const {
    data: { issues },
  } = await jiraAPI().request({
    method: 'GET',
    url: `/rest/agile/1.0/board/78/issue`,
    params: {
      maxResults: 1000,
      jql: getStatusOrFilter([
        'UAT',
        'Ready for PROD Deploy',
        'QA Failed',
        'QA In Progress',
        'RFT',
      ]),
    },
  });

  const groups = groupBy((item: Issue) => item.fields.status.name)(issues);
  await Bluebird.map(
    [...(groups['UAT'] || []), ...(groups['Ready for PROD Deploy'] || [])],
    async (issue) => {
      try {
        await jiraAPI().request({
          method: 'PUT',
          url: `rest/api/3/issue/${issue.key}`,
          data: {
            fields: {
              status: { id: '10467' },
            },
          },
        });
      } catch (error) {
        console.log((error as any).response);
      }
    },
    { concurrency: 5 },
  );

  console.log;
})();
