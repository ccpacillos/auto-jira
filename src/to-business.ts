import luxon from 'luxon-business-days';

const { DateTime } = luxon;

export default function toBusiness(dt: any) {
  dt.setupBusiness({
    holidayMatchers: [
      function (inst) {
        const phElectionDay = DateTime.fromObject({
          month: 5,
          day: 9,
          year: 2022,
        });

        return +inst === +phElectionDay;
      },
      function (inst) {
        const labourDay = DateTime.fromObject({
          month: 5,
          day: 2,
          year: 2022,
        });

        return +inst === +labourDay;
      },
    ],
  });

  return dt;
}
