import getIssueDetails from './lib/get-issue-details.js';

(async function () {
  const details = await getIssueDetails('EU-4710');
  console.dir(details, { depth: null });
})();
