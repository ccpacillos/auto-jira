import axios from 'axios';

(async function () {
  const { data } = await axios
    .create({
      baseURL: process.env.ELASTICSEARCH_URI,
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME || '',
        password: process.env.ELASTICSEARCH_PASSWORD || '',
      },
    })
    .request({
      method: 'POST',
      data: {
        size: 1,
        query: {
          bool: {
            must: [
              {
                match: {
                  'json.tags': 'sendEmail',
                },
              },
            ],
          },
        },
      },
    });

  console.dir(data, { depth: null });
})();
