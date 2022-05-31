import { trim } from 'ramda';

export default function getIssueIdFromUrl(url: string) {
  const regex = new RegExp(/^https.*\/(EU-.*)$/);
  const [, issueId] = url.match(regex) || [];

  return trim(issueId) as string;
}
