import { DateTime } from 'luxon';
import * as R from 'ramda';
import { average, max, quantile } from 'simple-statistics';
import { Issue } from '../types.js';
import jiraAPI from './jira-api.js';

export async function getEpicTasksCompleted(params: {
  key: string;
  startAt?: number;
}) {
  const startAt = params.startAt || 0;
  const { data } = await jiraAPI().request({
    method: 'POST',
    url: `/rest/api/3/search`,
    data: {
      maxResults: 1000,
      jql: `parent = ${params.key} AND resolved IS NOT EMPTY`,
      startAt,
    },
  });

  if (
    data.maxResults < data.total &&
    startAt < data.total &&
    data.issues.length === data.maxResults
  ) {
    return R.concat(
      data.issues,
      await getEpicTasksCompleted({
        key: params.key,
        startAt: startAt + data.maxResults,
      }),
    );
  }

  return data.issues;
}

export async function getReleasedIssuesSince(params: {
  since: string;
  startAt?: number;
}): Promise<Issue[]> {
  const startAt = params.startAt || 0;
  const { data } = await jiraAPI().request({
    method: 'POST',
    url: `/rest/api/3/search`,
    data: {
      maxResults: 1000,
      jql: `
        project = EU
        AND resolved >= -${params.since}
        AND type IN (Task, Bug)
      `,
      startAt,
    },
  });

  if (
    data.maxResults < data.total &&
    startAt < data.total &&
    data.issues.length === data.maxResults
  ) {
    return R.concat(
      data.issues,
      await getReleasedIssuesSince({
        since: params.since,
        startAt: startAt + data.maxResults,
      }),
    );
  }

  return data.issues;
}

export async function getReleasedIssuesBetween(params: {
  gt: string;
  lt: string;
  startAt?: number;
}): Promise<Issue[]> {
  const startAt = params.startAt || 0;
  const { data } = await jiraAPI().request({
    method: 'POST',
    url: `/rest/api/3/search`,
    data: {
      maxResults: 1000,
      jql: `
        project = EU
        AND resolved > "${params.gt}"
        AND resolved <= "${params.lt}"
        AND type IN (Task, Bug)
        AND status != "Won't Fix"
      `,
      startAt,
    },
  });

  if (
    data.maxResults < data.total &&
    startAt < data.total &&
    data.issues.length === data.maxResults
  ) {
    return R.concat(
      data.issues,
      await getReleasedIssuesBetween({
        gt: params.gt,
        lt: params.lt,
        startAt: startAt + data.maxResults,
      }),
    );
  }

  return data.issues;
}

export async function getBugIssuesSince(params: {
  since: string;
  startAt?: number;
}): Promise<Issue[]> {
  const startAt = params.startAt || 0;
  const { data } = await jiraAPI().request({
    method: 'POST',
    url: `/rest/api/3/search`,
    data: {
      maxResults: 1000,
      jql: `
        project = EU
        AND created >= -${params.since}
        AND type = Bug
        AND status != "Won't Fix"
      `,
      startAt,
    },
  });

  if (
    data.maxResults < data.total &&
    startAt < data.total &&
    data.issues.length === data.maxResults
  ) {
    return R.concat(
      data.issues,
      await getBugIssuesSince({
        since: params.since,
        startAt: startAt + data.maxResults,
      }),
    );
  }

  return data.issues;
}

export async function getMetricsBetweenDates(gt: string, lt: string) {
  const released = await getReleasedIssuesBetween({
    gt,
    lt,
  });

  console.log(`Throughput: ${released.length}`);

  const cycleTimes = R.map((issue) => {
    let durationInDays: number;

    if (issue.fields.customfield_10750) {
      durationInDays = 0;
    } else {
      const startDate = DateTime.fromFormat(
        (issue.fields.customfield_10750 || issue.fields.created).split(
          'T',
        )[0] as string,
        'yyyy-MM-dd',
      );

      const endDate = DateTime.fromFormat(
        (issue.fields.resolutiondate as string).split('T')[0] as string,
        'yyyy-MM-dd',
      );

      durationInDays = endDate.diff(startDate, ['days']).days;
    }

    return {
      key: issue.key,
      durationInDays,
    };
  }, released as Issue[]);

  const durations = cycleTimes.map((item) => item.durationInDays);

  console.log(durations.join(','));

  const metrics = {
    average: average(durations),
    '95th': quantile(durations, 0.95),
    slowest: max(durations),
  };

  console.log(metrics);
}

export async function getMetricsOfEpic(params: { key: string }) {
  const childTasks = await getEpicTasksCompleted({ key: params.key });

  const cycleTimes = R.map((issue) => {
    let durationInDays;

    if (issue.fields.customfield_10750) {
      durationInDays = 0;
    } else {
      const startDate = DateTime.fromFormat(
        (issue.fields.customfield_10750 || issue.fields.created).split(
          'T',
        )[0] as string,
        'yyyy-MM-dd',
      );

      const endDate = DateTime.fromFormat(
        (issue.fields.resolutiondate as string).split('T')[0] as string,
        'yyyy-MM-dd',
      );

      durationInDays = endDate.diff(startDate, ['days']).days;
    }

    return {
      key: issue.key,
      durationInDays,
    };
  }, childTasks as Issue[]);

  const durations = cycleTimes.map((item) => item.durationInDays);

  console.log(durations.join(','));

  const metrics = {
    average: average(durations),
    '95th': quantile(durations, 0.95),
    slowest: max(durations),
  };

  console.log(metrics);
  R.filter(
    ({ durationInDays }) => durationInDays === metrics.slowest,
    cycleTimes,
  ).map(({ key }) => console.log(key));
}

async function overAllCycleTimes() {
  const releasedIssues = await getReleasedIssuesSince({ since: '14d' });

  const allCycleTimes = R.map((issue) => {
    const startDate = DateTime.fromFormat(
      (issue.fields.customfield_10750 || issue.fields.created).split(
        'T',
      )[0] as string,
      'yyyy-MM-dd',
    );

    const endDate = DateTime.fromFormat(
      (issue.fields.resolutiondate as string).split('T')[0] as string,
      'yyyy-MM-dd',
    );

    const durationInDays = endDate.diff(startDate, ['days']).days;

    if (durationInDays === 120) console.log(issue.key);

    return durationInDays;
  }, releasedIssues);

  console.log(allCycleTimes.join(','));
  console.log(max(allCycleTimes));
}
//getMetricsOfEpic({ key: 'EU-8922' }).then(() => console.log('done'));

async function bugsReported() {
  const bugs = await getBugIssuesSince({ since: '7d' });
  const done = R.filter((issue) => issue.fields.status.name === 'Done', bugs);

  const incomplete = R.filter(
    (issue) => !R.includes(issue.fields.status.name, ['Done', "Won't Fix"]),
    bugs,
  );

  console.log('all');
  console.log(bugs.length);
  console.log('resolved');
  console.log(done.length);
  console.log(
    done
      .map((issue) => `https://identifi.atlassian.net/browse/${issue.key}`)
      .join('\n'),
  );

  console.log('not done');
  console.log(incomplete.length);
  console.log(
    incomplete
      .map((issue) => `https://identifi.atlassian.net/browse/${issue.key}`)
      .join('\n'),
  );
}

export async function getBugsReportedBetween(params: {
  gt: string;
  lte: string;
  startAt?: number;
}): Promise<Issue[]> {
  const startAt = params.startAt || 0;
  const { data } = await jiraAPI().request({
    method: 'POST',
    url: `/rest/api/3/search`,
    data: {
      maxResults: 1000,
      jql: `
        project = EU
        AND created > "${params.gt}"
        AND created <= "${params.lte}"
        AND type = Bug
        AND status != "Won't Fix"
      `,
      startAt,
    },
  });

  if (
    data.maxResults < data.total &&
    startAt < data.total &&
    data.issues.length === data.maxResults
  ) {
    return R.concat(
      data.issues,
      await getBugsReportedBetween({
        gt: params.gt,
        lte: params.lte,
        startAt: startAt + data.maxResults,
      }),
    );
  }

  return data.issues;
}
