import { addIndex, map } from 'ramda';
import { Issue } from '../types';

export function toList(cards: Issue[], withStatus = false) {
  return addIndex(map)(
    (issue, index) =>
      `  ${index + 1}. ${(issue as Issue).fields.summary} - ${
        process.env.JIRA_URL
      }/browse/${(issue as Issue).key}${
        withStatus ? ` (${(issue as Issue).fields.status.name})` : ''
      }`,
    cards,
  ).join('\n');
}
