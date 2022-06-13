import fs from 'fs';
import Bluebird from 'bluebird';
import { omit } from 'ramda';
import elastic from '../lib/elastic.js';

const trackingIds = [
  {
    _id: 'bdp_86b21eb669de4bf588933a4cc7dc9c76',
  },
];

(async function () {
  const details = await Bluebird.map(
    trackingIds,
    async (trackingId) => {
      console.log(`Fetching tracking id: ${trackingId._id}`);
      const {
        data: {
          hits: {
            hits: [log],
          },
        },
      } = await elastic().request({
        data: {
          size: 1,
          query: {
            bool: {
              must: [
                {
                  match: {
                    'json.message.transaction.tracking_id': trackingId._id,
                  },
                },
              ],
            },
          },
        },
      });

      const transaction = omit(
        ['be_protected_verification'],
        JSON.parse(log._source.message).message.transaction,
      );

      if (!transaction) {
        console.log(`Transaction not found for: ${trackingId._id}`);
      }

      return transaction;
    },
    { concurrency: 3 },
  );

  fs.writeFileSync('./data.json', JSON.stringify(details), 'utf-8');
})();
