import axios from 'axios';

export default async function getIssueDetails(id: string) {
  const { data } = await axios
    .create({
      baseURL: process.env.JIRA_URL || '',
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: process.env.JIRA_USERNAME || '',
        password: process.env.JIRA_PASSWORD || '',
      },
    })
    .request({
      url: `/rest/api/latest/issue/${id}`,
    });

  return data;
}
