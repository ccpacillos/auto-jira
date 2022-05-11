import luxon from 'luxon';
import { filter, includes, map } from 'ramda';
import jiraAPI from '../lib/jira-api.js';
import { Issue } from '../types.js';
import coreEpics from './core-epics.js';

const { DateTime } = luxon;

(async function () {
  const from = DateTime.now().startOf('week').toFormat('yyyy-MM-dd');
  const to = DateTime.now().endOf('week').toFormat('yyyy-MM-dd');

  console.log('Fetching cards.');
  const {
    data: { issues: released },
  }: { data: { issues: Issue[] } } = await jiraAPI().request({
    method: 'GET',
    url: `/rest/agile/1.0/board/78/issue`,
    params: {
      maxResults: 1000,
      jql: `
        "Released[Date]" > "${from}"
        AND "Released[Date]" < "${to}"
      `,
    },
  });

  const backendCards = filter(
    ({ fields }) => includes('Backend', fields.labels),
    released,
  );

  const frontendCards = filter(
    ({ fields }) => includes('Frontend', fields.labels),
    released,
  );

  const core = filter(
    ({ fields }) => includes(fields.parent?.key, coreEpics),
    released,
  );

  const coreBackend = filter(
    ({ fields }) => includes(fields.parent?.key, coreEpics),
    backendCards,
  );

  const coreFrontend = filter(
    ({ fields }) => includes(fields.parent?.key, coreEpics),
    frontendCards,
  );

  const bugs = filter(
    ({ fields }) => fields.issuetype.name === 'Bug',
    released,
  );

  const bugsBackend = filter(
    ({ fields }) => fields.issuetype.name === 'Bug',
    backendCards,
  );

  const bugsFrontend = filter(
    ({ fields }) => fields.issuetype.name === 'Bug',
    frontendCards,
  );

  const defects = filter(
    ({ fields }) => fields.issuetype.name === 'Defect',
    released,
  );

  const defectsBackend = filter(
    ({ fields }) => fields.issuetype.name === 'Defect',
    backendCards,
  );

  const defectsFrontend = filter(
    ({ fields }) => fields.issuetype.name === 'Defect',
    frontendCards,
  );

  const blockers = filter(
    ({ fields }) => fields.issuetype.name === 'Blocker',
    released,
  );

  const blockersBackend = filter(
    ({ fields }) => fields.issuetype.name === 'Blocker',
    backendCards,
  );

  const blockersFrontend = filter(
    ({ fields }) => fields.issuetype.name === 'Blocker',
    frontendCards,
  );

  console.log(
    [
      `Released: ${released.length} (BE - ${backendCards.length}, FE - ${frontendCards.length})`,
      `Core: ${core.length} (BE - ${coreBackend.length}, FE - ${coreFrontend.length})`,
      `Bugs: ${bugs.length} (BE - ${bugsBackend.length}, FE - ${bugsFrontend.length})`,
      `Defects: ${defects.length} (BE - ${defectsBackend.length}, FE - ${defectsFrontend.length})`,
      `Blockers: ${blockers.length}, (BE - ${blockersBackend.length}, FE - ${blockersFrontend.length})`,
    ].join('\n'),
  );
})();
