import Bluebird from 'bluebird';
import { GoogleSpreadsheetRow } from 'google-spreadsheet';
import luxon from 'luxon-business-days';
import { map } from 'ramda';
import getEpicDetails from './get-epic-details.js';
import getSheet from './lib/sheets/get-sheet.js';

const { DateTime } = luxon;

const dt = DateTime.local();

dt.setupBusiness({
  holidayMatchers: [
    function (inst) {
      const phElectionDay = DateTime.fromObject({
        month: 5,
        day: 9,
        year: 2022,
      });

      return +inst === +phElectionDay;
    },
  ],
});

(async function () {
  const sheet = await getSheet('Current Epics');
  const rows = await sheet.getRows();
  await sheet.loadCells();

  const getCell = (row: GoogleSpreadsheetRow, column: number) =>
    sheet.getCell(row.rowIndex - 1, column);

  await Bluebird.map(
    [rows[0]],
    async (row) => {
      const [
        linkCell,
        titleCell,
        totalCardsCell,
        cardsInToDoCell,
        cardsInDevelopmentCell,
        toBeReleasedCell,
        releasedCell,
        cardsDoneCell,
        activeDevelopersCell,
        etaCell,
      ] = map((column) => getCell(row, column), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

      const regexp = new RegExp('^https://identifi.atlassian.net/browse/(.*)$');
      const [, key] = linkCell.value.toString().match(regexp) || ['', ''];

      console.log(`Updating epic card ${key}`);

      const epicDetails = await getEpicDetails(key);
      titleCell.value = epicDetails.title;
      totalCardsCell.value = epicDetails.totalCards;
      cardsInToDoCell.value = `${epicDetails.cardsInToDo} (${epicDetails.remainingCodeworkToDo}d)`;
      cardsInDevelopmentCell.value = `${epicDetails.cardsInDevelopment} (${epicDetails.remainingCodeworkInDev}d)`;
      toBeReleasedCell.value = epicDetails.toBeReleased;
      releasedCell.value = epicDetails.released;
      cardsDoneCell.value = epicDetails.cardsDone;
      activeDevelopersCell.value = epicDetails.activeAssignees;

      const eta =
        Math.ceil(epicDetails.remainingCodework / epicDetails.activeAssignees) -
        1;

      const etaDate = dt
        .startOf('day')
        .plusBusiness({ days: eta })
        .toFormat('MMMM dd, yyyy');

      etaCell.value = `${etaDate}`;
    },
    { concurrency: 5 },
  );

  await sheet.saveUpdatedCells();
})();
