import { find } from 'ramda';
import getIssueDetails from './lib/get-issue-details.js';
import jiraAPI from './lib/jira-api.js';

(async function () {
  const details = await getIssueDetails('EU-2010');

  console.dir(details.fields.issuetype, { depth: null });

  // const content =
  //   currentContent.length === 0
  //     ? [
  //         {
  //           type: 'paragraph',
  //           content: [
  //             {
  //               type: 'inlineCard',
  //               attrs: {
  //                 url: 'https://github.com/new-future-holdings/onewallet_monorepo/pull/2710',
  //               },
  //             },
  //             { type: 'text', text: ' ' },
  //           ],
  //         },
  //       ]
  //     : [
  //         {
  //           type: 'paragraph',
  //           content: [
  //             ...currentContent[0].content,
  //             { type: 'hardBreak' },
  //             {
  //               type: 'inlineCard',
  //               attrs: {
  //                 url: 'https://github.com/new-future-holdings/onewallet_monorepo/pull/2710',
  //               },
  //             },
  //             { type: 'text', text: ' ' },
  //           ],
  //         },
  //       ];

  // console.log('new content');
  // console.dir(
  //   {
  //     type: 'doc',
  //     version: 1,
  //     content,
  //   },
  //   { depth: null },
  // );

  // try {
  //   await jiraAPI().request({
  //     method: 'PUT',
  //     url: '/rest/api/3/issue/EU-3648',
  //     data: {
  //       fields: {
  //         customfield_10790: {
  //           type: 'doc',
  //           version: 1,
  //           content,
  //         },
  //       },
  //     },
  //   });
  // } catch (error) {
  //   console.log((error as any).response);
  // }
})();
