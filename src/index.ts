import updateSheet from './update-sheet.js';

(async function () {
  for await (const title of ['Priority Cards', 'This Week']) {
    await updateSheet(title);
  }

  console.log('Done.');
})();
