import { Issue } from '../types.js';
import jiraAPI from './jira-api.js';

export default async function getIssueDetails(id: string, apiVersion = '3') {
  const { data } = await jiraAPI().request({
    url: `/rest/api/${apiVersion}/issue/${id}`,
  });

  return data as Issue;
}
