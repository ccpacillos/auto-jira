import jiraAPI from './jira-api.js';

export default async function getIssueDetails(id: string) {
  const { data } = await jiraAPI().request({
    url: `/rest/api/latest/issue/${id}`,
  });

  return data;
}
