import { getMetricsBetweenDates } from './lib/metrics.js';
import { getBugsReportedBetween } from './lib/metrics.js';

const start = '2023-02-17 00:00';
const end = '2023-02-23 23:59';
console.log(end);
getMetricsBetweenDates(start, end).then(() => console.log('done'));

getBugsReportedBetween({
  gt: start,
  lte: end,
}).then((data) => {
  console.log(`Bugs Reported: ${data.length}`);
});
