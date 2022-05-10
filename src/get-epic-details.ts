import luxon from 'luxon-business-days';
import { filter, groupBy, map, sum, uniq } from 'ramda';
import getBusinessDaysDiff from './get-business-days-diff.js';
import getIssueDetails from './lib/get-issue-details.js';
import jiraAPI from './lib/jira-api.js';
import { Issue, Status } from './types.js';

const { DateTime } = luxon;

export default async function getEpicDetails(key: string) {
  const [
    {
      data: { issues: childIssues },
    },
    details,
  ] = await Promise.all([
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/issue`,
      params: {
        maxResults: 1000,
        jql: `
        parent = '${key}'
      `,
      },
    }),
    getIssueDetails(key),
  ]);

  const groups = groupBy(
    (issue) => issue.fields.status.name,
    childIssues as Issue[],
  );

  const getGroups = (status: Status) => groups[status] || [];

  const inToDo = groups['To Do'] || [];
  const inDev = [
    ...getGroups('In Progress'),
    ...getGroups('In Review'),
    ...getGroups('Merged In Dev'),
    ...getGroups('RFT'),
    ...getGroups('QA In Progress'),
    ...getGroups('QA Failed'),
  ];

  const toBeReleased = [
    ...getGroups('UAT'),
    ...getGroups('Ready for PROD Deploy'),
  ];

  const released = [
    ...getGroups('RFT - PROD'),
    ...getGroups('RFT - PROD Fail'),
  ];

  const done = groups['Done'] || [];

  const computeCodework = (issue: Issue) => {
    const {
      fields: { timeoriginalestimate, customfield_10750: startDate },
    } = issue;

    if (!timeoriginalestimate) {
      throw new Error(`No estimate has been set for card: ${issue.key}`);
    }

    const codework = startDate
      ? timeoriginalestimate * 3 -
        getBusinessDaysDiff(DateTime.fromISO(startDate))
      : timeoriginalestimate * 3;

    if (codework < 0) {
      console.log(`Card ${issue.key} is potentially underestimated.`);
    }

    return codework > 0 ? codework : 0;
  };

  const remainingCodework =
    sum(map((issue) => computeCodework(issue), [...inToDo, ...inDev])) /
    (24 * 60 * 60);

  const remainingCodeworkToDo =
    sum(map((issue) => computeCodework(issue), inToDo)) / (24 * 60 * 60);

  const remainingCodeworkInDev =
    sum(map((issue) => computeCodework(issue), inDev)) / (24 * 60 * 60);

  const activeAssignees = uniq(
    map(
      (issue: Issue) => issue.fields.assignee?.accountId,
      filter(({ fields }) => !!fields.assignee, [...inToDo, ...inDev]),
    ),
  );

  return {
    title: details.fields.summary,
    totalCards: childIssues.length,
    cardsInToDo: inToDo.length,
    cardsInDevelopment: inDev.length,
    cardsDone: done.length,
    toBeReleased: toBeReleased.length,
    released: released.length,
    remainingCodework,
    remainingCodeworkToDo,
    remainingCodeworkInDev,
    activeAssignees: activeAssignees.length,
  };
}
