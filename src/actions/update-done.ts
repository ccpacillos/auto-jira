import updateSheetDetails from '../lib/update-sheet-details.js';

(async function () {
  await updateSheetDetails('Done', false);
  await updateSheetDetails('Done For This Week', false);
})();
