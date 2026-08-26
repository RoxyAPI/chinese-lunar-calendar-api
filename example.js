import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY);

/**
 * Chinese Lunar Calendar API: a lunar date converter that runs both ways.
 * Send a Gregorian date to convert forward, or send lunarYear, lunarMonth and
 * lunarDay to convert back. The calendar is evaluated at a fixed UTC+8 reference
 * meridian, so the same instant yields the same lunar date anywhere in the world.
 */
async function main() {
  // Gregorian to lunar
  const forward = await roxy.chineseAstrology.calculateLunarDate({
    body: { date: '1990-06-15' },
  });
  if (forward.error) throw new Error(forward.error.error);
  const f = forward.data;

  console.log('Gregorian to lunar');
  console.log(`  ${f.gregorianDate} is lunar ${f.lunar.year}-${f.lunar.month}-${f.lunar.day}`);
  console.log(`  month length ${f.lunar.monthLength} days, leap ${f.lunar.isLeapMonth}, reference UTC+${f.referenceOffset}`);

  // Lunar to Gregorian
  const back = await roxy.chineseAstrology.calculateLunarDate({
    body: { lunarYear: 1990, lunarMonth: 5, lunarDay: 23 },
  });
  if (back.error) throw new Error(back.error.error);
  console.log('\nLunar to Gregorian');
  console.log(`  lunar 1990-5-23 is ${back.data.gregorianDate}`);

  // The leap repetition of the same month number
  const leap = await roxy.chineseAstrology.calculateLunarDate({
    body: { lunarYear: 1990, lunarMonth: 5, lunarDay: 23, isLeapMonth: true },
  });
  if (leap.error) throw new Error(leap.error.error);
  console.log('\nLeap month');
  console.log(`  1990 repeats month ${f.leapMonthOfYear}, so lunar 1990-5-23 exists twice`);
  console.log(`  first pass ${back.data.gregorianDate}, leap pass ${leap.data.gregorianDate}`);

  // The 24 solar terms as exact instants
  const terms = await roxy.chineseAstrology.listSolarTerms({ path: { year: 2026 } });
  if (terms.error) throw new Error(terms.error.error);

  console.log(`\nSolar terms of ${terms.data.year}, total ${terms.data.total}`);
  for (const term of terms.data.terms.slice(0, 4)) {
    console.log(`  ${term.id.padEnd(11)} ${term.chinese}  ${term.instantUtc}  local ${term.localDate} ${term.localTime}`);
  }
}

main().catch(console.error);
