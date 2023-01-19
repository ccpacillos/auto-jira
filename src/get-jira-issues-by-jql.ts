import jiraAPI from './lib/jira-api.js';
import { Issue } from './types.js';

(async function () {
  const { data } = await jiraAPI().request({
    method: 'POST',
    url: `/rest/api/3/search`,
    data: {
      maxResults: 1000,
      jql: `parent = EU-8508 AND type != "Story"`,
    },
  });

  data.issues.map((data: Issue) => {
    console.log(data.key, data.fields.status.name);
  });
})();
