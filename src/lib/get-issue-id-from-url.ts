import { trim } from 'ramda';

export default function getIssueIdFromUrl(url: string) {
  const regex = new RegExp(/^https.*\/(EU-.*)$/);
  const [, issueId] = url.match(regex) || [];

  if (!issueId) return null;

  return trim(issueId);
}
