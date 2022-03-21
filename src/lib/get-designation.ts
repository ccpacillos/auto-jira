import { find } from 'ramda';

const jiraUserIds = [
  {
    accountId: '5c7759ef36ce822fe7285181',
    name: 'John Michael Roa',
    designation: 'BE',
  },
  {
    accountId: '60d3d9ea946928007017b9dd',
    name: 'John Christopher Sotero',
    designation: 'FE',
  },
  {
    accountId: '5d59fb7261df2f0c9d6c2eb5',
    name: 'butch lendio',
    designation: 'BE',
  },
  {
    accountId: '61480577071141006aa7725f',
    name: 'Janel Janson',
    designation: 'BE',
  },
  {
    accountId: '557058:2237439d-7b17-4427-938e-bbcbf236fc54',
    name: 'Ralph Largo',
    designation: 'FE',
  },
  {
    accountId: '606436d08d057500687844f6',
    name: 'Jason Marc Mendoza',
    designation: 'BE',
  },
  {
    accountId: '5fb5d37b3b4f59006862702d',
    name: 'Emir Jo Jr.',
    designation: 'BE',
  },
  {
    accountId: '61079c37fc68c10069cad160',
    name: 'Christopher Pacillos',
    designation: 'BE',
  },
  {
    accountId: '557058:e466108c-6733-4ce6-8506-f6824aca94fd',
    name: 'John Lois Frades',
    designation: 'FE',
  },
  {
    accountId: '5d395122c2db730c59b28edd',
    name: 'Rodney Lingganay',
    designation: 'BE',
  },
  {
    accountId: '6029bc8e39ed51006a32f46f',
    name: 'Ceazar Masula',
    designation: 'BE',
  },
  {
    accountId: '5d44276c4ab9030da1422793',
    name: 'Luis Angelo Belmonte',
    designation: 'BE',
  },
];

export default function getDesignation(accountId: string) {
  const user = find(
    (item: { accountId: string; name: string; designation: string }) =>
      item.accountId === accountId,
  )(jiraUserIds);

  return user?.designation;
}
