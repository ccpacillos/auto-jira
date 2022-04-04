import jiraAPI from './jira-api.js';

export default async function getIssueDetails(id: string) {
  const { data } = await jiraAPI().request({
    url: `/rest/api/3/issue/${id}`,
  });

  return data;
}
