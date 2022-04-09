import { differenceWith, equals, filter, groupBy, includes, map } from 'ramda';
import getSheet from '../lib/get-sheet.js';
import jiraAPI from '../lib/jira-api.js';

const developmentLoadFilter = `
  status = "In Progress"
  OR status = "In Review"
  OR status = "Merged In Dev"
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
  console.log('Getting stats...');
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
    | 'Merged In Dev'
    | 'RFT'
    | 'QA In Progress'
    | 'QA Failed'
    | 'UAT'
    | 'Ready for PROD Deploy'
    | 'RFT - PROD'
    | 'RFT - PROD Fail'
    | 'To Do';

  type Issue = {
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
  };

  const currentIssues = differenceWith(
    (issueA: { key: string }, issueB: { key: string }) =>
      equals(issueA.key, issueB.key),
    allIssues,
    backlogIssues,
  ) as Issue[];

  const groups = groupBy((issue) => issue.fields.status.name, currentIssues);

  const [stats, thisWeek] = await Promise.all([
    getSheet('Stats (Current)'),
    getSheet('Current'),
  ]);
  const [statsRows, thisWeekRows] = await Promise.all([
    stats.getRows(),
    thisWeek.getRows(),
  ]);

  await Promise.all([stats.loadCells(), thisWeek.loadCells()]);

  const doneRows = filter(
    (row) => thisWeek.getCell(row.rowIndex - 1, 2)?.value === 'Done',
    thisWeekRows,
  );
  const feDone = filter(
    (row) =>
      thisWeek.getCell(row.rowIndex - 1, 2)?.value === 'Done' &&
      thisWeek.getCell(row.rowIndex - 1, 5)?.value === 'FE',
    thisWeekRows,
  );

  const beDone = filter(
    (row) =>
      thisWeek.getCell(row.rowIndex - 1, 2)?.value === 'Done' &&
      thisWeek.getCell(row.rowIndex - 1, 5)?.value === 'BE',
    thisWeekRows,
  );

  map((row) => {
    const [status, count] = [
      stats.getCell(row.rowIndex - 1, 0),
      stats.getCell(row.rowIndex - 1, 1),
    ];

    if (status.value === 'Done') {
      count.value = `${doneRows.length} (BE - ${beDone.length}, FE - ${feDone.length})`;

      return;
    }

    const group = groups[status.value as Status] || [];

    const fe = filter(
      (item: Issue) => includes('Frontend', item.fields.labels),
      group,
    );

    const be = filter(
      (item: Issue) => includes('Backend', item.fields.labels),
      group,
    );

    count.value = `${group.length} (BE - ${be.length}, FE - ${fe.length})`;
  }, statsRows);

  await stats.saveUpdatedCells();

  console.log(
    map(
      (key) => {
        const fe = filter(
          (item: Issue) => includes('Frontend', item.fields.labels),
          groups[key] || [],
        );

        const be = filter(
          (item: Issue) => includes('Backend', item.fields.labels),
          groups[key] || [],
        );

        return `${key}: ${groups[key]?.length || 0} (BE - ${be.length}, FE - ${
          fe.length
        })`;
      },
      [
        'To Do',
        'In Progress',
        'In Review',
        'Merged In Dev',
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
  console.log(
    `Done: ${doneRows.length} (BE - ${beDone.length}, FE - ${feDone.length})`,
  );
})();
