import luxon from 'luxon';
import { differenceWith, equals, groupBy } from 'ramda';
import jiraAPI from '../lib/jira-api.js';
import { toList } from '../lib/jira-cards-to-list.js';
import getReleasedCards from '../released/get-released-cards.js';
import { Issue } from '../types.js';

const { DateTime } = luxon;

(async function () {
  const {
    data: { issues },
  }: { data: { issues: Issue[] } } = await jiraAPI().request({
    method: 'GET',
    url: `/rest/agile/1.0/board/78/issue`,
    params: {
      maxResults: 1000,
      jql: `
        "Released[Date]" > "${DateTime.now()
          .minus({ day: 1 })
          .toFormat('yyyy-MM-dd')}"
      `,
    },
  });

  console.log(issues.length);

  const markdown = ['Released to PROD:', toList(issues)].join('\n');

  console.log(markdown);
})();
