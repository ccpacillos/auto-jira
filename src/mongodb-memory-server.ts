import Bluebird from 'bluebird';
import { MongoMemoryServer } from 'mongodb-memory-server';

(async function () {
  await Promise.all([
    (async function () {
      const instanceA = await MongoMemoryServer.create();
      console.log(instanceA.instanceInfo?.port);
      await Bluebird.delay(3000);
      console.log(instanceA.instanceInfo?.port);
      await instanceA.stop();
    })(),
    (async function () {
      const instanceB = await MongoMemoryServer.create();
      await Bluebird.delay(1000);
      await instanceB.stop();
    })(),
  ]);
})();
