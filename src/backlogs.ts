import Bluebird from 'bluebird';
import jiraAPI from './lib/jira-api.js';
import { Issue } from './types.js';

(async function () {
  const {
    data: { issues },
  } = await jiraAPI().request({
    method: 'GET',
    url: '/rest/agile/1.0/board/78/issue',
    params: {
      maxResults: 1000,
      jql: `status = "Won't Fix"`,
    },
  });

  console.log(issues.length);

  try {
    await Bluebird.map(
      issues as Issue[],
      async (issue) => {
        await jiraAPI().request({
          method: 'PUT',
          url: `/rest/api/3/issue/${issue.key}`,
          data: {
            fields: {
              assignee: null,
            },
          },
        });

        console.log(`Card ${issue.key} unassigned.`);
      },
      {
        concurrency: 10,
      },
    );
  } catch (error) {
    console.log((error as any).response);
  }
})();
