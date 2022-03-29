import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Bluebird from 'bluebird';
import jiraAPI from './lib/jira-api.js';

(async function () {
  const root = 'query';
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const files = fs.readdirSync(path.join(__dirname, `./files/wallet/${root}`));

  try {
    await Bluebird.map(
      files,
      async (file) => {
        await jiraAPI().request({
          method: 'POST',
          url: '/rest/api/3/issue',
          data: {
            fields: {
              summary: `Update ${root}/${file}`,
              parent: {
                key: 'EU-****',
              },
              issuetype: {
                id: '10266',
              },
              project: {
                id: '10649',
              },
              assignee: null,
              labels: ['Backend'],
            },
          },
        });
      },
      { concurrency: 5 },
    );
  } catch (error) {
    console.log((error as any).response);
  }
})();
