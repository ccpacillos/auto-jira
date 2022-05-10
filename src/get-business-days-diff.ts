import luxon from 'luxon-business-days';
import logger from './lib/logger.js';

const { DateTime } = luxon;

export default function getBusinessDaysDiff(
  from: typeof DateTime,
  to?: typeof DateTime,
) {
  const _to =
    to ||
    (DateTime.now().isBusinessDay()
      ? DateTime.now().startOf('day')
      : DateTime.now().plusBusiness().startOf('day'));

  let dateCursor: typeof DateTime = from;
  let days = 0;

  if (_to.diff(from) > 0) {
    while (_to.diff(dateCursor).milliseconds > 0) {
      dateCursor = dateCursor.plusBusiness();

      days += 1;
    }
  }

  if (_to.diff(from) < 0) {
    while (_to.diff(dateCursor).milliseconds < 0) {
      dateCursor = dateCursor.minusBusiness();

      days -= 1;
    }
  }

  return days * 24 * 60 * 60;
}
