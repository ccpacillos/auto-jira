import axios from 'axios';

export default function jiraAPI() {
  return axios.create({
    baseURL: process.env.JIRA_URL || '',
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      username: process.env.JIRA_USERNAME || '',
      password: process.env.JIRA_PASSWORD || '',
    },
    validateStatus: null,
  });
}
