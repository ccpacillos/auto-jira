import { differenceWith, equals, filter, groupBy, map } from 'ramda';
import getSheet from '../lib/get-sheet.js';
import jiraAPI from '../lib/jira-api.js';

const developmentLoadFilter = `
  status = "In Progress"
  OR status = "In Review"
  OR status = "Merge In Dev"
  OR status = "RFT"
  OR status = "QA In Progress"
  OR status = "QA Failed"
  OR status = "UAT"
  OR status = "RFT - PROD"
  OR status = "RFT - PROD Fail"
  OR status = "Ready for PROD Deploy"
  OR status = "To Do"
`;

(async function () {
  const [
    {
      data: { issues: allIssues },
    },
    {
      data: { issues: backlogIssues },
    },
  ] = await Promise.all([
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/issue`,
      params: {
        maxResults: 1000,
        jql: developmentLoadFilter,
      },
    }),
    jiraAPI().request({
      method: 'GET',
      url: `/rest/agile/1.0/board/78/backlog`,
      params: {
        maxResults: 1000,
        jql: developmentLoadFilter,
      },
    }),
  ]);

  type Status =
    | 'In Progress'
    | 'In Review'
    | 'Merge In Dev'
    | 'RFT'
    | 'QA In Progress'
    | 'QA Failed'
    | 'UAT'
    | 'Ready for PROD Deploy'
    | 'RFT - PROD'
    | 'RFT - PROD Fail';

  const currentIssues = differenceWith(
    (issueA: { key: string }, issueB: { key: string }) =>
      equals(issueA.key, issueB.key),
    allIssues,
    backlogIssues,
  ) as {
    key: string;
    fields: {
      summary: string;
      status: {
        name: Status;
      };
      assignee: { displayName: string } | null;
      labels: string[];
      priority: {
        name: string;
      };
      issuetype: {
        name: string;
      };
    };
  }[];

  const groups = groupBy((issue) => issue.fields.status.name, currentIssues);

  const [stats, thisWeek] = await Promise.all([
    getSheet('Stats (This Week)'),
    getSheet('This Week'),
  ]);
  const [statsRows, thisWeekRows] = await Promise.all([
    stats.getRows(),
    thisWeek.getRows(),
  ]);

  await Promise.all([stats.loadCells(), thisWeek.loadCells()]);

  const doneCount = filter(
    (row) => thisWeek.getCell(row.rowIndex - 1, 2)?.value === 'Done',
    thisWeekRows,
  ).length;

  map((row) => {
    const [status, count] = [
      stats.getCell(row.rowIndex - 1, 0),
      stats.getCell(row.rowIndex - 1, 1),
    ];

    if (status.value === 'Done') {
      count.value = doneCount;

      return;
    }

    count.value = groups[status.value as Status]?.length || 0;
  }, statsRows);

  await stats.saveUpdatedCells();

  console.log(
    map(
      (key) => `${key}: ${groups[key]?.length || 0}`,
      [
        'To Do',
        'In Progress',
        'In Review',
        'Merge In Dev',
        'RFT',
        'QA In Progress',
        'QA Failed',
        'UAT',
        'Ready for PROD Deploy',
        'RFT - PROD',
        'RFT - PROD Fail',
      ],
    ).join('\n'),
  );
  console.log(`Done: ${doneCount}`);
})();
