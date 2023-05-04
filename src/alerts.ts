import Bluebird from 'bluebird';
import fetch from 'node-fetch';
// async function getMonitors() {
//   const monitors = await fetch('https://betteruptime.com//api/v2/monitors', {
//     method: 'GET',
//     headers: {
//       Authorization: 'Bearer GmDoo2MHjVypaouUtbVNaoxC'
//     }
//   }).then(res => res.json());
//   return monitors.data.map( monitor => ({ id: monitor.id, name: monitor.attributes.pronounceable_name  }));
// }
const backendMonitors = [
  { id: '921385', name: 'devops.nexiux.io/ping/account' },
  { id: '921387', name: 'devops.nexiux.io/ping/admin' },
  { id: '921389', name: 'devops.nexiux.io/ping/affiliate' },
  { id: '921390', name: 'devops.nexiux.io/ping/eventstore' },
  { id: '921391', name: 'devops.nexiux.io/ping/job' },
  { id: '921392', name: 'devops.nexiux.io/ping/member' },
  { id: '921393', name: 'devops.nexiux.io/ping/memberloyalty' },
  { id: '921394', name: 'devops.nexiux.io/ping/message' },
  { id: '921395', name: 'devops.nexiux.io/ping/promo' },
  { id: '921397', name: 'devops.nexiux.io/ping/report' },
  { id: '921398', name: 'devops.nexiux.io/ping/system' },
  { id: '921399', name: 'devops.nexiux.io/ping/vendor' },
  { id: '921400', name: 'devops.nexiux.io/ping/wallet' },
  { id: '1091791', name: 'devops.nexiux.io/ping/rebate' },
  { id: '1091793', name: 'devops.nexiux.io/ping/saga' },
  { id: '1091794', name: 'devops.nexiux.io/ping/subscription' },
  { id: '945356', name: 'api-admin.nexiux.io/health' },
  { id: '945357', name: 'api-site.nexiux.io/health' },
  { id: '945358', name: 'api-authentication.nexiux.io/health' },
  { id: '1167122', name: 'API: Query.memberBetRecords' },
  { id: '1168508', name: 'API: Query.Me' },
  { id: '1173254', name: 'API: Query.Members' },
  { id: '1176970', name: 'API: Query.affiliateRequests' },
  { id: '1176976', name: 'API: Query.admins' },
  { id: '1176999', name: 'API: Query.messages' },
  { id: '1177012', name: 'API: Query.memberLoyaltyLevels' },
  { id: '1177019', name: 'API: Query.rebateGroups' },
];
async function updateMonitor(id: string, paused: boolean) {
  return fetch(`https://betteruptime.com/api/v2/monitors/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: 'Bearer GmDoo2MHjVypaouUtbVNaoxC',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paused }),
  }).then((res) => res.json());
}

(async () => {
  await Bluebird.map(
    backendMonitors,
    async (monitor) => {
      await updateMonitor(monitor.id, false);
      console.log(monitor.name, 'updated');
    },
    { concurrency: 1 },
  );
})();
