import jiraAPI from '../lib/jira-api.js';
import { Issue } from '../types.js';

export default async function getReleasedCards(from: string, to: string) {
  const {
    data: { issues },
  }: { data: { issues: Issue[] } } = await jiraAPI().request({
    method: 'GET',
    url: `/rest/agile/1.0/board/78/issue`,
    params: {
      maxResults: 1000,
      jql: `
        "Released[Date]" > "${from}"
        AND "Released[Date]" < "${to}"
      `,
    },
  });

  return issues;
}
