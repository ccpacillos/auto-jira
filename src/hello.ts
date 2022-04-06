import { filter, isEmpty, unnest } from 'ramda';

console.log(
  filter((item) => !isEmpty(item))([
    '',
    '5 Dryvers Close',
    'Little Canfield',
    '',
    '',
    'Essex' || 'Essex',
  ]).join(', '),
);
