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
        'RFT',
        'QA In Progress',
        'QA Failed',
      ]),
    },
  });

  const groups = groupBy((item: Issue) => item.fields.status.name)(issues);

  await Bluebird.map(
    [...groups['UAT'], ...groups['Ready for PROD Deploy']],
    async (issue) => {},
    { concurrency: 5 },
  );
  console.log(groups);
})();
