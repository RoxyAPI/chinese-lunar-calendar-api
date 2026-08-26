import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);

/**
 * Chinese Lunar Calendar API: convert Gregorian to lunar and lunar to Gregorian
 * through one endpoint. The lunisolar calendar is evaluated at a fixed UTC+8
 * reference meridian, so a lunar date is the same worldwide rather than shifting
 * with the caller timezone. Leap months are addressed explicitly through
 * isLeapMonth, and the solar terms come back as exact instants.
 */
async function main() {
  // 1. Gregorian to lunar. Send a date and read the lunisolar date back.
  const forward = await roxy.chineseAstrology.calculateLunarDate({
    body: { date: '1990-06-15' },
  });
  if (forward.error) throw new Error(forward.error.error);
  const f = forward.data;

  console.log('Gregorian to lunar');
  console.log(`  ${f.gregorianDate} is lunar ${f.lunar.year}-${f.lunar.month}-${f.lunar.day}`);
  console.log(`  leap month: ${f.lunar.isLeapMonth}, month length: ${f.lunar.monthLength} days`);
  console.log(`  this lunisolar year repeats month: ${f.leapMonthOfYear ?? 'none'}`);
  console.log(`  reference offset: UTC+${f.referenceOffset}`);

  // 2. Lunar to Gregorian. Send the three lunar fields to convert the other way.
  const back = await roxy.chineseAstrology.calculateLunarDate({
    body: { lunarYear: 1990, lunarMonth: 5, lunarDay: 23 },
  });
  if (back.error) throw new Error(back.error.error);

  console.log('\nLunar to Gregorian');
  console.log(`  lunar 1990-5-23 is ${back.data.gregorianDate}`);

  // 3. The same lunar date in the LEAP repetition of month 5. 1990 has thirteen
  // lunar months, so month 5 comes round twice and only isLeapMonth separates them.
  const leap = await roxy.chineseAstrology.calculateLunarDate({
    body: { lunarYear: 1990, lunarMonth: 5, lunarDay: 23, isLeapMonth: true },
  });
  if (leap.error) throw new Error(leap.error.error);

  console.log('\nThe leap month, addressed explicitly');
  console.log(`  lunar 1990-5-23 first pass  ${back.data.gregorianDate}  (${back.data.lunar.monthLength} day month)`);
  console.log(`  lunar 1990-5-23 leap pass   ${leap.data.gregorianDate}  (${leap.data.lunar.monthLength} day month)`);
  console.log('  A lunar birthday feature that ignores isLeapMonth is a month out here.');

  // 4. The 24 solar terms of a solar year, each as an exact instant.
  const terms = await roxy.chineseAstrology.listSolarTerms({ path: { year: 2026 } });
  if (terms.error) throw new Error(terms.error.error);
  const t = terms.data;

  console.log(`\nThe 24 solar terms of solar year ${t.year}, total ${t.total}`);
  const minor = t.terms.filter((x) => x.type === 'minor').length;
  console.log(`  minor terms ${minor}, major terms ${t.terms.length - minor}`);

  for (const term of t.terms.slice(0, 4)) {
    console.log(`  ${term.id.padEnd(11)} ${term.chinese}  lon ${String(term.longitude).padStart(3)}  ${term.instantUtc}  local ${term.localDate} ${term.localTime}`);
  }

  const liChun = t.terms[0];
  if (liChun) {
    console.log('\n  A term is an instant, not a date:');
    console.log(`  ${liChun.name} lands at ${liChun.instantUtc} in UTC,`);
    console.log(`  which is ${liChun.localDate} ${liChun.localTime} at the reference meridian.`);
  }

  const last = t.terms[t.terms.length - 1];
  if (last) {
    console.log(`\n  The solar year runs Li Chun to Li Chun, so the last term,`);
    console.log(`  ${last.name}, is dated ${last.localDate}, inside the following January.`);
  }
}

main().catch(console.error);
