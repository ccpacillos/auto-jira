import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { loadJsonFile } from 'load-json-file';

export default async function getSheet(title: string) {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  await doc.useServiceAccountAuth(
    await loadJsonFile(
      path.join(__dirname, '/../../../google-credentials.json'),
    ),
  );

  await doc.loadInfo();
  const sheet = doc.sheetsByTitle[title];

  return sheet;
}
