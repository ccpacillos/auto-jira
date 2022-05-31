import luxon from 'luxon';
import {
  filter,
  groupBy,
  identity,
  includes,
  keys,
  map,
  sort,
  sortBy,
  uniqBy,
} from 'ramda';
import { mean, quantile, max, min } from 'simple-statistics';
import getBusinessDaysDiff from '../get-business-days-diff.js';
import getCardsOfWeek from '../get-cards-of-week.js';
import getCardsOnBoard from '../get-cards-on-board.js';
import jiraAPI from '../lib/jira-api.js';
import getSheet from '../lib/sheets/get-sheet.js';
import toBusiness from '../to-business.js';
import { Issue } from '../types.js';
import coreEpics from './core-epics.js';
import getReleasedCards from './get-released-cards.js';

const { DateTime } = luxon;

(async function () {
  const from = DateTime.now().startOf('week').minus({ day: 2 });
  const to = DateTime.now().endOf('week').minus({ day: 1 });
  const [released, onBoard, sheet] = await Promise.all([
    getReleasedCards(from.toFormat('yyyy-MM-dd'), to.toFormat('yyyy-MM-dd')),
    getCardsOfWeek(from.toFormat('yyyy-MM-dd')),
    getSheet('May 9 - May 13', '1mURimK3xb7lOmUZcQc7Hpuab8_2R5e8JptLHyRnTh6E'),
  ]);

  const newBugs = filter(
    ({ fields }) =>
      fields.issuetype.name === 'Bug' &&
      (fields.customfield_10800 as string) > from.toFormat('yyyy-MM-dd'),
    onBoard,
  );

  const todo = filter(({ fields }) => fields.status.name === 'To Do', onBoard);

  const onGoing = filter(
    ({ fields }) =>
      includes(fields.status.name, [
        'In Progress',
        'In Review',
        'Merged In Dev',
        'RFT',
        'QA In Progress',
        'QA Failed',
        'UAT',
        'Ready for PROD Deploy',
      ]),
    onBoard,
  );

  const prodFailed = filter(
    ({ fields }) => fields.status.name === 'RFT - PROD Fail',
    onBoard,
  );

  const cycleTimes = map(({ fields }) => {
    const diff = getBusinessDaysDiff(
      toBusiness(
        DateTime.fromFormat(fields.customfield_10800 as string, 'yyyy-MM-dd'),
      ),
      toBusiness(
        DateTime.fromFormat(fields.customfield_10799 as string, 'yyyy-MM-dd'),
      ),
    );

    return diff / (24 * 60 * 60);
  }, filter(({ fields }) => !!fields.customfield_10800, released) as Issue[]);

  const cyclesDisplay = [
    `Mean: ${Math.ceil(mean(cycleTimes))}d`,
    `95th: ${quantile(cycleTimes, 0.95)}d`,
    `Max: ${max(cycleTimes)}d`,
    `Min: ${min(cycleTimes)}d`,
  ].join(', ');

  const done = filter(({ fields }) => fields.status.name === 'Done', onBoard);

  const allBugs = filter(
    ({ fields }) => fields.issuetype.name === 'Bug',
    onBoard,
  );

  const resolvedBugs = filter(
    ({ fields }) => fields.status.name === 'Done',
    allBugs,
  );

  console.log(
    [
      `Released: ${released.length}`,
      `Cycle Times: ${cyclesDisplay}`,
      `To Do: ${todo.length}`,
      `Ongoing: ${onGoing.length}`,
      `Prod Failed: ${prodFailed.length}`,
      `Bugs: ${allBugs.length} (New - ${newBugs.length})`,
      `Resolved Bugs: ${resolvedBugs.length}`,
      `Done: ${done.length}`,
    ].join('\n'),
  );

  // console.log(cycleTimes.join('\n'));
})();
