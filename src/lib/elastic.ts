import axios from 'axios';

export default function elastic() {
  return axios.create({
    method: 'POST',
    baseURL: process.env.ELASTICSEARCH_URI || '',
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME || '',
      password: process.env.ELASTICSEARCH_PASSWORD || '',
    },
  });
}
