import Bluebird from 'bluebird';

async function wait() {
  const map = new Map();

  map.set('a', true);

  await Promise.all([
    (async () => {
      while (map.get('a')) {
        console.log('hello');
        await Bluebird.delay(200);
      }
    })(),
    (async () => {
      console.log('whasdfasdfasdfasfasdf');
      await Bluebird.delay(3000);
      map.delete('a');
    })(),
  ]);
}

wait().then(() => {
  console.log('hi');
});
