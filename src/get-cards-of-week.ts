import luxon from 'luxon';
import { differenceWith, equals, map } from 'ramda';
import jiraAPI from './lib/jira-api.js';
import { Issue } from './types.js';

const { DateTime } = luxon;

export default async function getCardsOfWeek(from: string) {
  const [
    {
      data: { issues: allIssues },
    },
    {
      data: { issues: backlogIssues },
    },
    {
      data: { issues: doneIssues },
    },
  ] = await Promise.all([
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/issue`,
      params: {
        maxResults: 1000,
        jql: `
          status != "Won't Fix"
          AND
          status != "Done"
          AND
          type != "Epic"
          AND
          type != "Subtask"
        `,
      },
    }),
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/backlog`,
      params: {
        maxResults: 1000,
        jql: `
          status != "Won't Fix"
          AND
          status != "Done"
          AND type != "Epic"
          AND type != "Subtask"
        `,
      },
    }),
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/issue`,
      params: {
        maxResults: 1000,
        jql: `
          status = "Done"
          AND resolutiondate > ${from}
          AND type != "Epic"
          AND type != "Subtask"
        `,
      },
    }),
  ]);

  return differenceWith(
    (issueA: { key: string }, issueB: { key: string }) =>
      equals(issueA.key, issueB.key),
    [...allIssues, ...doneIssues],
    backlogIssues,
  ) as Issue[];
}
