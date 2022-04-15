import { differenceWith, equals, filter, intersperse, map } from 'ramda';
import jiraAPI from './lib/jira-api.js';
import slackAPI from './lib/slack.js';
import { Issue } from './types.js';

(async function (env: 'production' | 'staging') {
  const jql =
    env === 'production'
      ? `
    status = "RFT" or
    status = "QA In Progress" or
    status = "QA Failed" or
    status = "UAT" or
    status = "Ready for PROD Deploy"
  `
      : `
    status = "Merged In Dev"
  `;

  const [
    {
      data: { issues },
    },
    {
      data: { issues: backlogIssues },
    },
  ] = await Promise.all([
    jiraAPI().request({
      method: 'GET',
      url: '/rest/agile/latest/board/78/issue',
      params: {
        maxResults: 1000,
        jql,
      },
    }),
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/backlog`,
      params: {
        maxResults: 1000,
        jql,
      },
    }),
  ]);

  const currentIssues = differenceWith(
    (issueA: Issue, issueB: Issue) => equals(issueA.key, issueB.key),
    issues,
    backlogIssues,
  );

  const options = map((issue: Issue) => {
    const link = `<${process.env.JIRA_URL}/browse/${issue.key}|${issue.fields.summary}>`;

    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${link}\n${issue.fields['customfield_10793']}`,
      },
    };
  })(
    filter((issue: Issue) => !!issue.fields['customfield_10793'])(
      currentIssues,
    ),
  );

  const blocks =
    options.length > 0
      ? intersperse(
          {
            type: 'divider',
          },
          [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Deployment requirements for ${env}:*`,
              },
            },
            ...options,
          ] as any[],
        )
      : [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `There are no documented deployment checks for ${env} release.`,
            },
          },
        ];

  const { data } = await slackAPI.chat.post({
    channel: 'wallet-incident-alerts',
    text: 'Deployment checks',
    blocks,
  });

  console.log(data);
})('production');
