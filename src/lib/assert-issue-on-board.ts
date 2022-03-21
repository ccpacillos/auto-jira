import jiraAPI from './jira-api.js';

export default async function assertIssueOnBoard(id: string) {
  // https://<mycompany>.atlassian.net/rest/agile/1.0/board/<boardid>/issue

  const {
    data: { issues: backlogIssues },
  } = await jiraAPI().request({
    url: `/rest/agile/1.0/board/78/backlog`,
    params: {
      jql: `key = "${id}"`,
    },
  });

  if (backlogIssues.length > 0) {
    console.log(`Moving issue ${id} to the board.`);
    await jiraAPI().request({
      method: 'POST',
      url: `/rest/agile/1.0/board/78/issue`,
      data: { issues: [id] },
    });
  }
}
