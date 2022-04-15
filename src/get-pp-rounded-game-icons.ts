import Bluebird from 'bluebird';
import { filter, find, includes, map } from 'ramda';
import { createClient, FileStat } from 'webdav';
import getSheet from './lib/sheets/get-sheet.js';

const baseURL =
  'https://marketing.pragmaticplay.com/public.php/webdav/Marketing%20Materials/Materials%20%26%20Assets/Video%20Slots';

async function getData(path) {
  return await createClient(`${baseURL}${path}`, {
    headers: {
      Authorization: `Basic ${process.env.PP_WEBDAV_AUTH}`,
    },
  }).getDirectoryContents('/');
}

(async function () {
  const games = (await getData('/')) as FileStat[];

  // console.log(games);
  const gamesDirectories = filter(
    (game) =>
      !includes(game.filename, [
        '/Table Games',
        '/Fruit Party™',
        '/Drago - Jewels of Fortune™',
        '/Book of Vikings™',
        '/Beowulf™',
        '/Mysterious™',
        '/Hot to Burn™',
        '/Golden Beauty™',
        'Beowulf™',
        '/Aztec Bonanza™',
      ]),
    games,
  );

  console.log(games.length);
  console.log(gamesDirectories.length);

  const downloadLinks = await Bluebird.map(
    gamesDirectories,
    async (game) => {
      const iconsDir = (await getData(
        `${encodeURI(`${game.filename}/Icons`)}`,
      )) as FileStat[];

      const subDirName =
        filter((dir) => dir.basename === 'PNG', iconsDir).length > 0
          ? 'PNG'
          : filter((dir) => dir.basename === 'Icons.PNG', iconsDir).length > 0
          ? 'Icons.PNG'
          : filter((dir) => dir.basename === 'PNG & JPG', iconsDir).length > 0
          ? 'PNG & JPG'
          : filter((dir) => dir.basename === 'PNG & JPEG', iconsDir).length > 0
          ? 'PNG & JPEG'
          : filter((dir) => dir.basename === 'PNG&JPG', iconsDir).length > 0
          ? 'PNG&JPG'
          : filter((dir) => dir.basename === 'JPG_PNG', iconsDir).length > 0
          ? 'JPG_PNG'
          : filter((dir) => dir.basename === 'PNG_JPG', iconsDir).length > 0
          ? 'PNG_JPG'
          : filter((dir) => dir.basename === 'PNGs', iconsDir).length > 0
          ? 'PNGs'
          : 'else';

      const pngDir = (await getData(
        `${encodeURI(`${game.filename}/Icons/${subDirName}`)}`,
      )) as FileStat[];

      const regex = new RegExp(/.*200x200_round.*/);
      const roundedIcon = find(
        (item) => regex.test(item.basename.toLowerCase()),
        pngDir,
      );

      let url: null | string = null;

      if (roundedIcon) {
        const root = '/Marketing Materials/Materials & Assets/Video Slots';
        const gameBasename = game.basename;
        const iconsSubDirName = encodeURI(subDirName).replace('&', '%26');
        const path = `${encodeURIComponent(
          `${root}/${gameBasename}/Icons`,
        )}%2F${iconsSubDirName}&files=${roundedIcon.basename}`;
        url = `https://marketing.pragmaticplay.com/index.php/s/W9G7V1q7a5Bv059/download?path=${path}`;
      }

      return {
        game: game.basename,
        url,
      };
    },
    { concurrency: 20 },
  );

  const withUrls = filter(({ url }) => !!url, downloadLinks);
  const sheet = await getSheet('PP Icons');
  await sheet.addRows(
    map((item: { game: string; url: string | null }) => [
      item.game,
      item.url || '',
    ])(withUrls),
  );

  console.log(withUrls.map((item) => `${item.game}: ${item.url}`));
})();
