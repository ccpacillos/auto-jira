import fs from 'fs';
import Bluebird from 'bluebird';
import { omit } from 'ramda';
import elastic from '../lib/elastic.js';

const trackingIds = [
  {
    _id: 'bdp_8ad4d5bba77142c8bd74cc5fc057c151',
  },
  {
    _id: 'bdp_f328cb4831ed4a9cb433263bf06f8803',
  },
  {
    _id: 'bdp_08b2801e493242e3b82575da96695383',
  },
  {
    _id: 'bdp_c19f6938954f44f4a4b6bb66d8aff487',
  },
  {
    _id: 'bdp_2feeb18e00534750906e2886e123e22b',
  },
  {
    _id: 'bdp_1cfd6e7af86a4e46b8c42504a37e23d5',
  },
  {
    _id: 'bdp_f6fedc0d2f51481f957e14f264a0870b',
  },
  {
    _id: 'bdp_864dffccc8ee47f7a818e17dbc6d77d0',
  },
  {
    _id: 'bdp_138cdfb631d24d48a539dc95b6494598',
  },
  {
    _id: 'bdp_6cb7b93c89014d43b78a9429d21e10d4',
  },
  {
    _id: 'bdp_78e604f59c4a4627856bfd0089f17e1f',
  },
  {
    _id: 'bdp_0ac89fdc7b754eb8b3f11dd4e21c6d41',
  },
  {
    _id: 'bdp_627c2bdebf2f4cd284b3119687c4c797',
  },
  {
    _id: 'bdp_48a8dcb0077a4f9dbc3c5a5d320454c7',
  },
  {
    _id: 'bdp_a3a9a9912cd14f448a1fcbdc7185657e',
  },
  {
    _id: 'bdp_3baf2ca9e15a4a219680f3358d497772',
  },
  {
    _id: 'bdp_619871094d4042928a96ad6213cde47f',
  },
  {
    _id: 'bdp_9e84ae60d11f4ce8bb6592c6337271c5',
  },
  {
    _id: 'bdp_05b0f840b4c94e0088fc29947068f4c4',
  },
  {
    _id: 'bdp_d2962e4ac24f48ae81c7e6cea2c8e2cc',
  },
  {
    _id: 'bdp_0de77667225a45e7a6cf4abd1c60538e',
  },
  {
    _id: 'bdp_d528f6174c934df4bd7c55788fc794c4',
  },
  {
    _id: 'bdp_f59fdc38d3fc4853b66441ce2db25a9c',
  },
  {
    _id: 'bdp_0d2c3f2c28b14715ae4f23d8946d835d',
  },
  {
    _id: 'bdp_0067f01314d74579b2bec8323118b719',
  },
  {
    _id: 'bdp_be9fd400d914424a9dbb8c9879ed21a9',
  },
  {
    _id: 'bdp_4834ca8f9e4c4556b181b09b27c408d2',
  },
  {
    _id: 'bdp_3c6ef4fd5d0a4b55ab369d29fadb0153',
  },
  {
    _id: 'bdp_cc3ae5f3d8b640a19104fdc56508b2da',
  },
  {
    _id: 'bdp_a41a9a81ebf949199fec1edd6cc5b51e',
  },
  {
    _id: 'bdp_63fab74386144c84b03dc9e44b1f2661',
  },
  {
    _id: 'bdp_6a0a1be93fe9427ca37288ea252a8c45',
  },
  {
    _id: 'bdp_82af7936a28d4dc7a837b9867e806465',
  },
  {
    _id: 'bdp_b8ef692f094345c8a5d0cbc93af6a6c3',
  },
  {
    _id: 'bdp_ae907906f00d4006950bb4fe07698179',
  },
  {
    _id: 'bdp_56d3bcf04c854f3685957c2e82717a6f',
  },
  {
    _id: 'bdp_7040fc70ce0c4df9980867e678f749e0',
  },
  {
    _id: 'bdp_b971a0aa0a2c44eaa79f44cdcaca6245',
  },
  {
    _id: 'bdp_14f5604ff7634e35962550c77ca9543b',
  },
  {
    _id: 'bdp_c0f3a6217990409ca503c3c3ecca5ff8',
  },
  {
    _id: 'bdp_9f854816b2bf4721ade73e9e1016f046',
  },
  {
    _id: 'bdp_021244c111b1426e8693c4703fd44ff6',
  },
  {
    _id: 'bdp_980426035d214d8893d49936d7436d9e',
  },
  {
    _id: 'bdp_3caa7376e5484e998ca631dfb3eea078',
  },
  {
    _id: 'bdp_69d8ef02d0f94db0b0d60156671162be',
  },
  {
    _id: 'bdp_0b6266e2469b4e2c8a1ed29bb2f87dd0',
  },
  {
    _id: 'bdp_385c289f88204db5983d50ff828e0672',
  },
  {
    _id: 'bdp_212c6278c40642718f8648f4bcd76bfb',
  },
  {
    _id: 'bdp_1a5995081fc440b6a8fbf3f01c9ed9c3',
  },
  {
    _id: 'bdp_d383917ff38d49c79288165e9a6bee16',
  },
  {
    _id: 'bdp_8ebf4428d3344545b007e5f42f866569',
  },
  {
    _id: 'bdp_962ea4a31dd4440ba81833e71eeef38c',
  },
  {
    _id: 'bdp_2396ac2799a44469b9f29944dc904ea1',
  },
  {
    _id: 'bdp_63c8eaafeffe494cabe283049a25eafa',
  },
  {
    _id: 'bdp_7e480fb2118e4ef0a2d7003d00af0eb4',
  },
  {
    _id: 'bdp_d9143b4f50c343a19dc12930be001836',
  },
  {
    _id: 'bdp_82bc71bb97394071bde34a47ea70a78d',
  },
  {
    _id: 'bdp_e046f41d7d4c462fadc7081a57763d7a',
  },
  {
    _id: 'bdp_7b232ce962934f02bdc1ddcb8ff91137',
  },
  {
    _id: 'bdp_2a3a62ceb0d440d5beae853f3466376a',
  },
  {
    _id: 'bdp_f3b540e7bda640cdb6a1343edc74ecf0',
  },
  {
    _id: 'bdp_b381c2f714254cd596e0c7950ecfb779',
  },
  {
    _id: 'bdp_476bcbfa35234300bf31cc283318882a',
  },
  {
    _id: 'bdp_ba0a098748d7416eaa74823f85c377bc',
  },
  {
    _id: 'bdp_26af3243138b480f9df8e69cca37135c',
  },
  {
    _id: 'bdp_9cc2f62a700d49bf9c0281f75371f9ea',
  },
  {
    _id: 'bdp_67c9fa6fb1d748488681ff1f5c76c243',
  },
  {
    _id: 'bdp_f5e82a8effd647b88b3d59d3bd872334',
  },
  {
    _id: 'bdp_56cdd9b36a9d4845971209bc782025de',
  },
  {
    _id: 'bdp_411b0db040ed42ae9de945400dfc505a',
  },
  {
    _id: 'bdp_4b6d920a5fc74f33b461e7afeb0739d6',
  },
  {
    _id: 'bdp_77663aa5b4b2434a83438797f6b3866c',
  },
  {
    _id: 'bdp_91a62a54a40c47189dcd33861f5e107e',
  },
  {
    _id: 'bdp_e93edb2b625e4d38950fc6e1ea9e2507',
  },
  {
    _id: 'bdp_03ab0996656942b0a20b62dc135e8cfe',
  },
  {
    _id: 'bdp_35313cf451bc40b9b223d6f4436f38df',
  },
  {
    _id: 'bdp_85b5a40586cf46c2bb0be7b7aaee7a02',
  },
  {
    _id: 'bdp_10c5eb8fa716440d90fc87f47254e5ed',
  },
  {
    _id: 'bdp_fd5f6373dc824bfa9ecff41f88a73579',
  },
  {
    _id: 'bdp_c6a158d18735433499752a1e21cf3124',
  },
  {
    _id: 'bdp_5b37b3165bde4810ac9e31c8fe29c456',
  },
  {
    _id: 'bdp_28651d92eb444d55a389de8c2c331202',
  },
  {
    _id: 'bdp_c7852926f58c476e950cd1aa2c7f0c6e',
  },
  {
    _id: 'bdp_3b1445757f104e73a3bfc671fcb2aa01',
  },
  {
    _id: 'bdp_76b4a269be36476f9d0792536f4da1b1',
  },
  {
    _id: 'bdp_3a1ce6773cf24c9b838e3e7881e17a70',
  },
  {
    _id: 'bdp_005686402ea9436bb79fe91581533bd4',
  },
  {
    _id: 'bdp_448badbeae774a70837e7b4350ca6062',
  },
  {
    _id: 'bdp_62ea5841b9674c53aa486f99768a787b',
  },
  {
    _id: 'bdp_c2c2363ce5c045c2b84f9e35cdb46af2',
  },
  {
    _id: 'bdp_dd7b7bbd2c574724bfea5e9fc86bce3e',
  },
  {
    _id: 'bdp_569bcda6d3d44c4b9f3255f9c9147526',
  },
  {
    _id: 'bdp_2197da0865ce4031b119720ecbe22ffa',
  },
  {
    _id: 'bdp_015cadfb50384c4788e3b94ee8b4938c',
  },
  {
    _id: 'bdp_4078d8f6508b4364a0c188a10c16af04',
  },
  {
    _id: 'bdp_c58a67aced1146f39654f7b853afa63e',
  },
  {
    _id: 'bdp_b270e177a91b4156a42a623b624be794',
  },
  {
    _id: 'bdp_7d62cce5b1f34bdc8527445ab4abe57d',
  },
  {
    _id: 'bdp_b99bd30b9b024e4ab3ea0221145fcdc8',
  },
  {
    _id: 'bdp_9e955e97d0c34b70bb48ad65840f6998',
  },
  {
    _id: 'bdp_f0812ba687594ffd8a0278ca51c85aba',
  },
  {
    _id: 'bdp_6e9073ea397443cca72c3254a941f6b2',
  },
  {
    _id: 'bdp_3bce416a1dab40ff92b04b22c9730bc4',
  },
  {
    _id: 'bdp_ccc483efc65a4646b2f415fe2594219c',
  },
  {
    _id: 'bdp_7173f513a92348f481d080742aca5fcd',
  },
  {
    _id: 'bdp_bea67be1f4684f6ca1c096c97974fef1',
  },
  {
    _id: 'bdp_10c403c51d654657b2b50d6c48cd3e9e',
  },
  {
    _id: 'bdp_0b8ebde0a5fb454a9956cc43d5ef0550',
  },
  {
    _id: 'bdp_5337c7ddf6774d9995c809e5ebcbe532',
  },
  {
    _id: 'bdp_e98d392ab9c841528191c063d1a1de1e',
  },
  {
    _id: 'bdp_16b9a796b7364b2c8493481c1331fcba',
  },
  {
    _id: 'bdp_6e56334c5ca04a4c953a44eb689b67cd',
  },
  {
    _id: 'bdp_6f35525401ce4b99926ec3308709f554',
  },
  {
    _id: 'bdp_18b30a03cf0442479269c600fef5edcf',
  },
  {
    _id: 'bdp_16e9b023d9244c91a073d2f4af8313e2',
  },
  {
    _id: 'bdp_d1bc327c9c3944198d4cc4618aaf746a',
  },
  {
    _id: 'bdp_38793946ce654f0dbbc14df74227ec8a',
  },
  {
    _id: 'bdp_474f48efbcc24f42a30d1142dd8ed831',
  },
  {
    _id: 'bdp_40a72b14074647f2a0e4647b35dbebf6',
  },
  {
    _id: 'bdp_a27e7e53b19c4899ac13e1b2bade4c2f',
  },
  {
    _id: 'bdp_aa2792aca8c74c1d9d416d3a9899fce3',
  },
  {
    _id: 'bdp_10df8287b6054f38b22b69a84b54246e',
  },
  {
    _id: 'bdp_af417162ce364dcb96f3c0911d50de57',
  },
  {
    _id: 'bdp_b355fb94eb194941816ea22cc6c0a74d',
  },
  {
    _id: 'bdp_b263b202297e4846933077087ae7c5aa',
  },
  {
    _id: 'bdp_d4942f045c414b88be4ab69663bd9939',
  },
  {
    _id: 'bdp_e9062152a27d4654b54b5e09f82a5c6f',
  },
];

(async function () {
  const details = await Bluebird.map(
    trackingIds,
    async (trackingId) => {
      console.log(`Fetching tracking id: ${trackingId._id}`);
      const {
        data: {
          hits: {
            hits: [log],
          },
        },
      } = await elastic().request({
        data: {
          size: 1,
          query: {
            bool: {
              must: [
                {
                  match: {
                    'json.tags.keyword': 'HexoPay Request',
                  },
                },
                {
                  match: {
                    'json.message.transaction.tracking_id': trackingId._id,
                  },
                },
              ],
            },
          },
        },
      });

      const transaction = omit(
        ['be_protected_verification'],
        JSON.parse(log._source.message).message.transaction,
      );

      if (!transaction) {
        console.log(`Transaction not found for: ${trackingId._id}`);
      }

      return transaction;
    },
    { concurrency: 3 },
  );

  fs.writeFileSync('./data.json', JSON.stringify(details), 'utf-8');
})();
