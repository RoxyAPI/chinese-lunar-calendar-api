# AGENTS.md for Chinese Lunar Calendar API

This repo teaches AI coding agents (Cursor, Claude Code, Aider, Codex, Windsurf, RooCode, Gemini CLI) how to use the RoxyAPI lunar date endpoint, which converts between the Chinese lunisolar calendar and the Gregorian calendar in both directions.

## Endpoint
- Method: `POST`
- URL: `https://roxyapi.com/api/v2/chinese-astrology/calendar/lunar-date`
- Auth: `X-API-Key` header
- Domain: `chinese-astrology` (one of 14+ in the RoxyAPI catalog)
- Operation ID: `calculateLunarDate` matches the SDK method name in camelCase
- MCP tool: `post_chinese_astrology_calendar_lunar_date` on `https://roxyapi.com/mcp/chinese-astrology`

## The one thing to get right
This endpoint runs in BOTH directions and infers which one from the fields you send.

- Send `date` to convert Gregorian to lunar.
- Send `lunarYear`, `lunarMonth` and `lunarDay` to convert lunar to Gregorian.
- Send both sides and you get a 400. Send only part of the lunar side and you get a 400.
- Send an empty body to convert the current UTC date.

## TypeScript SDK
```ts
import { createRoxy } from '@roxyapi/sdk';
const roxy = createRoxy(process.env.ROXY_API_KEY!);

// Gregorian to lunar
const forward = await roxy.chineseAstrology.calculateLunarDate({
  body: { date: '1990-06-15' },
});

// Lunar to Gregorian, leap repetition of month 5
const back = await roxy.chineseAstrology.calculateLunarDate({
  body: { lunarYear: 1990, lunarMonth: 5, lunarDay: 23, isLeapMonth: true },
});

// The 24 solar terms of a solar year
const terms = await roxy.chineseAstrology.listSolarTerms({ path: { year: 2026 } });
```

## Python SDK
```python
import os
from roxy_sdk import create_roxy
roxy = create_roxy(os.environ["ROXY_API_KEY"])

forward = roxy.chinese_astrology.calculate_lunar_date(date="1990-06-15")
back = roxy.chinese_astrology.calculate_lunar_date(
    lunar_year=1990, lunar_month=5, lunar_day=23, is_leap_month=True
)
terms = roxy.chinese_astrology.list_solar_terms(year=2026)
```

## Setup step (no coordinates, no timezone)
This endpoint takes no latitude, no longitude and no timezone. Do not call `/location/search` for it, and do not ask the user where they are. The lunisolar calendar is evaluated at a fixed UTC+8 reference meridian rather than at the caller location, so a date is the whole input. Nothing else in the Chinese astrology or feng shui families requires coordinates either: `latitude` and `longitude` are optional on the BaZi routes and only matter when `hourClock` is set to `local-mean` or `solar`.

## Request fields
- `date` (string, optional): Gregorian date YYYY-MM-DD to convert forward. Send this OR the lunar fields, never both
- `lunarYear` (number, optional): lunisolar year 1900 to 2100 to convert back. Requires `lunarMonth` and `lunarDay`
- `lunarMonth` (number, optional): lunar month 1 to 12. Requires `lunarYear` and `lunarDay`
- `lunarDay` (number, optional): day of the lunar month 1 to 30. Requires `lunarYear` and `lunarMonth`
- `isLeapMonth` (boolean, optional): true addresses the leap repetition of `lunarMonth` rather than the first pass. Defaults to false. Requesting a leap month a year does not have returns 400
- `lang` (query, optional): `en`, `tr`, `de`, `es`, `hi`, `pt`, `fr`, `ru`, `zh-Hans`, `zh-Hant`. Defaults to `en`. Accepted, but this endpoint returns no prose field, so the response is byte identical in every language. Do not add it expecting a localized result. It is `listSolarTerms` that localizes, in its `name` field only

## Response top level keys
- `gregorianDate` (string): the Gregorian date. Echoed when one was sent, computed when the lunar fields were, and the current UTC date when neither side was supplied
- `lunar` (object): `year`, `month`, `day`, `isLeapMonth`, `monthLength` (29 or 30), and `date`, the Gregorian date this lunar day covers at the reference meridian
- `leapMonthOfYear` (number, optional): the month this lunisolar year repeats when it has thirteen months. ABSENT in a twelve month year, never null and never 0
- `referenceOffset` (number): decimal UTC offset the calendar was evaluated at. Fixed at 8

## Domain rules
- Never call `/location/search` for this endpoint. It takes no coordinates.
- Branch on the PRESENCE of `leapMonthOfYear`, not on a sentinel. It is omitted in a twelve month year.
- A leap month repeats the number of the month it follows, so a lunar month number is not unique inside a year. `lunarMonth` alone does not identify a month: `lunarMonth` plus `isLeapMonth` does. Lunar 1990-5-23 resolves to 1990-06-15 with `isLeapMonth` false and to 1990-07-15 with it true.
- `lunar.year` advances on the first day of month 1, not at Li Chun, so it can lag the Gregorian year by up to seven weeks. Do not assume `lunar.year` equals the Gregorian year of `gregorianDate`.
- `lunar.monthLength` is 29 or 30 and varies month to month, because it is the interval between two new moons. Never hardcode 30.
- `referenceOffset` is fixed at 8 and the calendar is evaluated there, so the same instant yields the same lunar date for every caller anywhere. Do not shift the result into a local timezone.
- Supported range is 1900 to 2100 on both calendars.
- Solar terms are instants, not dates. `instantUtc` is the exact moment, and `localDate` plus `localTime` are that moment at the reference meridian. Sort and compare on `instantUtc`, display `localDate`.
- The `id` and `type` fields on a solar term are stable English machine values and are never localized. Branch on them safely under any language. Only `name` translates when `?lang=` is set, and several English renderings of a term are in circulation, so never key on `name`.
- The month pillar changes at the twelve terms of `type` `minor`. A lunar month containing no `major` term is the leap month, which is the rule that places `leapMonthOfYear`.
- The solar year in `/calendar/solar-terms/{year}` opens at Li Chun in early February, so the last two terms, Minor Cold and Major Cold, are dated in the January of the following Gregorian year. Do not treat the response as one Gregorian calendar year.

## Related endpoints
- `GET /chinese-astrology/calendar/solar-terms/{year}` (`listSolarTerms`, `get_chinese_astrology_calendar_solar_terms_year`): the 24 solar terms of a solar year, each with `longitude`, `type`, `instantUtc`, `localDate` and `localTime`
- `GET /chinese-astrology/calendar/monthly` (`getMonthlyAlmanac`, `get_chinese_astrology_calendar_monthly`): every day of one Gregorian month with lunisolar date, pillars, day officer and mansion, plus the solar terms inside the month
- `GET /chinese-astrology/calendar/day/{date}` (`getAlmanacDay`, `get_chinese_astrology_calendar_day_date`): the Tong Shu almanac view of one day, with day officer, lunar mansion, clash animal, and the activities it favours or avoids
- `POST /chinese-astrology/calendar/auspicious-days` (`lookupAuspiciousDays`, `post_chinese_astrology_calendar_auspicious_days`): search up to 93 days for the days a chosen activity is favoured on
- `POST /chinese-astrology/bazi/chart` (`generateBaziChart`, `post_chinese_astrology_bazi_chart`): the four pillars of a birth moment, with the school conventions typed as request parameters and echoed back in a `conventions` object

## Verified
2026-Q3 against `https://roxyapi.com/api/v2/openapi.json`. Re-fetch the spec for ground truth before changing this file.

## Discovery
- Full catalog: https://roxyapi.com/AGENTS.md
- LLM index: https://roxyapi.com/llms.txt
- Methodology: https://roxyapi.com/methodology
