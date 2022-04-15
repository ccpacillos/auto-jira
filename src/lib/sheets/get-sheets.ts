import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { loadJsonFile } from 'load-json-file';
import { map } from 'ramda';

export default async function getSheets(titles: string[]) {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  await doc.useServiceAccountAuth(
    await loadJsonFile(
      path.join(__dirname, '../../../google-credentials.json'),
    ),
  );

  await doc.loadInfo();

  return map((title) => doc.sheetsByTitle[title], titles);
}
