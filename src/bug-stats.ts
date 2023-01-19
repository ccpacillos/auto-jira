import { groupBy, keys, sort } from 'ramda';
import jiraAPI from './lib/jira-api.js';

(async function () {
  const {
    data: { issues },
  } = await jiraAPI().request({
    method: 'GET',
    url: '/rest/agile/1.0/board/78/issue',
    params: {
      maxResults: 2000,
      jql: `
      type = "Bug" AND
      status != "Won't Fix" AND
      created > "2022-01-01"
    `,
    },
  });

  const groups = groupBy((issue) => {
    const [year, month] = issue.fields.created.split('-');

    return `${year}-${month}`;
  }, issues as any[]);

  const diff = function (a: string, b: string) {
    const [, monthA] = a.split('-');
    const [, monthB] = b.split('-');

    return Number(monthA) - Number(monthB);
  };

  sort(diff, keys(groups)).map((key) =>
    console.log(`${key}: ${groups[key].length}`),
  );
})();
