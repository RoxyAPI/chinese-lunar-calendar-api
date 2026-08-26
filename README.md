[![Chinese Lunar Calendar API](banner.png)](https://roxyapi.com/products/chinese-astrology-api)

# Chinese Lunar Calendar API

> Chinese lunar calendar API and lunar date converter that runs both ways. Send a Gregorian date to get the lunisolar date, or send a lunar year, month and day to get the Gregorian date back. Leap months are returned explicitly, the 24 solar terms come back as exact instants, and the calendar is evaluated at a fixed reference meridian so a lunar date is the same worldwide. One key covers 14+ spiritual domains. MCP-first.

[![Get API Key](https://img.shields.io/badge/Get_API_Key-RoxyAPI-14b8a6?style=for-the-badge&logo=key&logoColor=white)](https://roxyapi.com/pricing)
[![Try Live](https://img.shields.io/badge/Try_API_Live-Free_in_browser-22c55e?style=for-the-badge&logo=swagger&logoColor=white)](https://roxyapi.com/api-reference)
[![Languages](https://img.shields.io/badge/Languages-9_locales_plus_English-f59e0b?style=for-the-badge&logo=googletranslate&logoColor=white)](https://roxyapi.com/api-reference)
[![MCP Server](https://img.shields.io/badge/MCP_Server-Streamable_HTTP-8b5cf6?style=for-the-badge&logo=anthropic&logoColor=white)](https://roxyapi.com/docs/mcp)
[![SDK](https://img.shields.io/badge/SDK-TypeScript_+_Python_+_PHP_+_C%23_+_Go_+_WordPress-3b82f6?style=for-the-badge&logo=npm&logoColor=white)](https://roxyapi.com/docs/sdk)

## What is Chinese Lunar Calendar API

The Chinese calendar is lunisolar: months follow the moon, the year is kept in step with the sun by inserting a thirteenth month when it drifts. This repo ships working TypeScript, JavaScript, and Python samples against the RoxyAPI lunar date endpoint, which is a lunar date converter in both directions through one call. Pass `date` to go Gregorian to lunar. Pass `lunarYear`, `lunarMonth` and `lunarDay` to go lunar to Gregorian. Either way the response reports the length of the lunar month, whether the date sits in a leap month, which month the year doubles if any, and the reference meridian the lunisolar calendar was evaluated at. A companion endpoint returns the 24 solar terms of a solar year as exact astronomical instants. One subscription unlocks 14+ spiritual domains: Western astrology, Vedic astrology, Forecast, Human Design, Chinese astrology, Feng Shui, numerology, tarot, biorhythm, I Ching, crystals, dreams, angel numbers, and location.

## Why call an API for a lunar date converter

A lunisolar date reads like arithmetic until the edge cases arrive. Four properties are what this endpoint is for.

**Leap months are returned, not inferred.** The month containing the winter solstice is fixed as month 11, which anchors the numbering, and a leap month repeats the number of the month it follows, placed at the first month of the cycle that carries no major solar term. The response says so directly: `lunar.isLeapMonth` marks the date itself, and `leapMonthOfYear` names the month the year doubles. In a twelve month year `leapMonthOfYear` is absent rather than a sentinel value, so a caller branches on presence. Lunar 1990-5-23 exists twice, on 1990-06-15 in the first pass through month 5 and on 1990-07-15 in the leap pass, and only `isLeapMonth` separates them.

**A lunar date is a world constant.** The lunisolar calendar is computed at a fixed UTC+8 reference meridian, which is why the same instant yields the same lunar date whether the caller sits in Lima or Sydney. `referenceOffset` publishes that frame on every response instead of leaving it implicit, so a client never has to guess whose midnight a date rolled over at.

**Solar terms are instants, not dates.** Each of the 24 terms is the moment the sun reaches an exact apparent longitude at 15 degree steps, and the response carries `instantUtc` alongside `localDate` and `localTime`. The distinction is not academic. Li Chun 2026 falls at `2026-02-03T20:01:54.541Z`, which is 04:01:54 on 2026-02-04 at the reference meridian, so a fixed table of dates disagrees with itself depending on where it is read.

**Breadth on one key.** The same key reaches the Tong Shu almanac day view, the month grid, date selection, BaZi four pillars, the twelve animal zodiac, feng shui, and every other domain in the catalog, so this Chinese calendar API is never a single purpose dependency you have to justify on its own.

## Why this API

| Property | Value |
|----------|-------|
| Coverage | 14+ spiritual domains in one subscription |
| Directions | Gregorian to lunar and lunar to Gregorian, one endpoint |
| Leap months | Addressed explicitly through `isLeapMonth`, reported through `leapMonthOfYear` |
| Reference frame | Fixed UTC+8 meridian, published on every response as `referenceOffset` |
| Range | Years 1900 to 2100 |
| Languages | Nine locales alongside English, including Simplified and Traditional Chinese |
| MCP server | `https://roxyapi.com/mcp/chinese-astrology` (Streamable HTTP, no local setup) |
| SDKs | TypeScript on npm `@roxyapi/sdk`, Python on PyPI `roxy-sdk`, PHP on Packagist `roxyapi/sdk`, C# on NuGet `RoxyApi.Sdk`, Go `github.com/RoxyAPI/sdk-go`, WordPress plugin `roxyapi` |
| Pricing | One key, flat per call, from $39/mo |
| Licensing | Personal and commercial use, including closed source apps. No AGPL or GPL entanglement. [Full terms](https://roxyapi.com/policy/license) |
| Last verified | 2026-Q3 |

## Quick start

1. Get a key at [roxyapi.com/pricing](https://roxyapi.com/pricing)
2. Pick a language below
3. Copy the snippet, run, ship

This endpoint takes no coordinates and no timezone. The lunisolar calendar is evaluated at its own reference meridian, so a date is all the input a conversion needs.

### cURL

Gregorian to lunar:

```bash
curl -X POST https://roxyapi.com/api/v2/chinese-astrology/calendar/lunar-date \
  -H "X-API-Key: $ROXY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "date": "1990-06-15" }'
```

Lunar to Gregorian, addressing the leap repetition of month 5:

```bash
curl -X POST https://roxyapi.com/api/v2/chinese-astrology/calendar/lunar-date \
  -H "X-API-Key: $ROXY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "lunarYear": 1990, "lunarMonth": 5, "lunarDay": 23, "isLeapMonth": true }'
```

### Python

```python
import os
from roxy_sdk import create_roxy

roxy = create_roxy(os.environ["ROXY_API_KEY"])

# Gregorian to lunar
forward = roxy.chinese_astrology.calculate_lunar_date(date="1990-06-15")
print(forward["gregorianDate"], "is lunar", forward["lunar"]["year"], forward["lunar"]["month"], forward["lunar"]["day"])
print("year repeats month:", forward.get("leapMonthOfYear", "none"))

# Lunar to Gregorian
back = roxy.chinese_astrology.calculate_lunar_date(lunar_year=1990, lunar_month=5, lunar_day=23)
print("lunar 1990-5-23 is", back["gregorianDate"])

# The leap repetition of the same month number
leap = roxy.chinese_astrology.calculate_lunar_date(
    lunar_year=1990, lunar_month=5, lunar_day=23, is_leap_month=True
)
print("leap pass is", leap["gregorianDate"])
```

### JavaScript (Node)

```js
import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY);

// Gregorian to lunar
const forward = await roxy.chineseAstrology.calculateLunarDate({
  body: { date: '1990-06-15' },
});
if (forward.error) throw new Error(forward.error.error);
const { lunar, leapMonthOfYear } = forward.data;
console.log(`lunar ${lunar.year}-${lunar.month}-${lunar.day}, month length ${lunar.monthLength}`);
console.log('year repeats month:', leapMonthOfYear ?? 'none');

// Lunar to Gregorian
const back = await roxy.chineseAstrology.calculateLunarDate({
  body: { lunarYear: 1990, lunarMonth: 5, lunarDay: 23 },
});
if (back.error) throw new Error(back.error.error);
console.log('lunar 1990-5-23 is', back.data.gregorianDate);
```

### TypeScript

```ts
import { createRoxy } from '@roxyapi/sdk';

const roxy = createRoxy(process.env.ROXY_API_KEY!);

// Lunar to Gregorian, addressing the leap repetition of month 5
const { data, error } = await roxy.chineseAstrology.calculateLunarDate({
  body: { lunarYear: 1990, lunarMonth: 5, lunarDay: 23, isLeapMonth: true },
});

if (error) throw new Error(error.error);

console.log(`Gregorian date: ${data.gregorianDate}`);
console.log(`Leap month: ${data.lunar.isLeapMonth}, month length ${data.lunar.monthLength}`);
console.log(`Reference offset: UTC+${data.referenceOffset}`);
```

## Request schema

Send the Gregorian side or the lunar side, never both. Sending both returns 400, and so does sending only part of the lunar side. Send an empty body to convert the current date.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | no | Gregorian date in YYYY-MM-DD format to convert to the lunisolar calendar. Send this OR the lunar fields, never both |
| `lunarYear` | number | no | Lunisolar year, 1900 to 2100, to convert back to a Gregorian date. Requires `lunarMonth` and `lunarDay` |
| `lunarMonth` | number | no | Lunar month, 1 to 12. Requires `lunarYear` and `lunarDay` |
| `lunarDay` | number | no | Day of the lunar month, 1 to 30. Requires `lunarYear` and `lunarMonth` |
| `isLeapMonth` | boolean | no | Set true to address the leap repetition of `lunarMonth` rather than the first pass. Requesting a leap month a year does not have returns 400. Defaults to false |
| `lang` | query | no | Response language, BCP 47. One of `en`, `tr`, `de`, `es`, `hi`, `pt`, `fr`, `ru`, `zh-Hans`, `zh-Hant`. Defaults to `en`. Accepted here, though a conversion returns numbers and dates rather than prose, so this response is byte identical in every language. It is the solar terms endpoint below where `lang` changes the output |

## Response shape

Gregorian to lunar for `1990-06-15`:

```json
{
  "gregorianDate": "1990-06-15",
  "lunar": {
    "year": 1990,
    "month": 5,
    "day": 23,
    "isLeapMonth": false,
    "monthLength": 30,
    "date": "1990-06-15"
  },
  "leapMonthOfYear": 5,
  "referenceOffset": 8
}
```

The same lunar date in the leap repetition of month 5, which resolves to a different Gregorian day and a shorter month:

```json
{
  "gregorianDate": "1990-07-15",
  "lunar": {
    "year": 1990,
    "month": 5,
    "day": 23,
    "isLeapMonth": true,
    "monthLength": 29,
    "date": "1990-07-15"
  },
  "leapMonthOfYear": 5,
  "referenceOffset": 8
}
```

| Field | Type | Description |
|-------|------|-------------|
| `gregorianDate` | string | The Gregorian date. Echoed when one was sent, computed when the lunar fields were, and the current UTC date when neither side was supplied |
| `lunar.year` | number | Lunisolar year. It advances on the first day of month 1, not at Li Chun, so it can lag the Gregorian year by up to seven weeks |
| `lunar.month` | number | Lunar month, 1 to 12. A leap month repeats the number of the month it follows |
| `lunar.day` | number | Day of the lunar month, 1 to 30. A lunar month never has 31 days |
| `lunar.isLeapMonth` | boolean | True when this is the leap repetition of the month number rather than the first pass through it |
| `lunar.monthLength` | number | Days in this lunar month, 29 for a short month or 30 for a long one. It is the interval between two new moons, so it varies month to month |
| `lunar.date` | string | The Gregorian date this lunar day covers, evaluated at the reference meridian |
| `leapMonthOfYear` | number | The month this lunisolar year repeats, when it has thirteen months. Absent in a twelve month year, so a caller can branch on presence rather than on a sentinel |
| `referenceOffset` | number | Decimal UTC offset the calendar was evaluated at. Fixed at 8, which is what makes a Chinese lunar date a world constant |

## The 24 solar terms

The solar terms are the sun half of the lunisolar calendar and the reason it stays in step with the seasons. `GET /chinese-astrology/calendar/solar-terms/{year}` returns all 24 for a solar year, each computed from the moment the sun reaches its exact apparent longitude at 15 degree steps.

Three things about the shape matter for anything time sensitive.

The year is the SOLAR year, which opens at Li Chun in early February. Its last two terms, Minor Cold and Major Cold, are therefore dated in the January of the following Gregorian year. The month pillar changes at the twelve terms marked `minor`, and a lunar month containing no `major` term is the leap month, which is the rule the leap placement above comes from. And every instant is returned twice, once as `instantUtc` and once as the `localDate` plus `localTime` pair at the reference meridian, so a caller can render an almanac date and still sort by a real timestamp.

```bash
curl https://roxyapi.com/api/v2/chinese-astrology/calendar/solar-terms/2026 \
  -H "X-API-Key: $ROXY_API_KEY"
```

```json
{
  "year": 2026,
  "referenceOffset": 8,
  "total": 24,
  "terms": [
    {
      "id": "li-chun",
      "name": "Beginning of Spring",
      "chinese": "立春",
      "pinyin": "lì chūn",
      "longitude": 315,
      "type": "minor",
      "instantUtc": "2026-02-03T20:01:54.541Z",
      "localDate": "2026-02-04",
      "localTime": "04:01:54"
    },
    {
      "id": "yu-shui",
      "name": "Rain Water",
      "chinese": "雨水",
      "pinyin": "yǔ shuǐ",
      "longitude": 330,
      "type": "major",
      "instantUtc": "2026-02-18T15:51:32.389Z",
      "localDate": "2026-02-18",
      "localTime": "23:51:32"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `year` | number | Echo of the solar year requested |
| `referenceOffset` | number | Decimal UTC offset of the reference meridian the local fields are given at. Fixed at 8 |
| `total` | number | Number of terms returned, which is always 24 |
| `terms[].id` | string | Term identifier in kebab case pinyin. A stable machine value, never localized, because the English names are not standardised |
| `terms[].name` | string | Display name of the term. Several English renderings are in circulation, so treat this as a label and the `id` as the value. This is the field `?lang=` translates |
| `terms[].chinese` | string | The term in Chinese. A data field, identical in every language |
| `terms[].pinyin` | string | Tone marked pinyin for the characters |
| `terms[].longitude` | number | Apparent solar longitude in degrees that defines the term. A multiple of 15, and the only thing about a term that is not a convention |
| `terms[].type` | string | Either `minor` or `major`. The month pillar changes at the twelve minor terms, and a lunar month containing no major term is the leap month |
| `terms[].instantUtc` | string | The instant the sun reaches the longitude, as an ISO-8601 UTC datetime |
| `terms[].localDate` | string | Calendar date of the instant at the reference meridian. This is the date printed in an almanac |
| `terms[].localTime` | string | Time of day of the instant at the reference meridian |

## Common use cases

| Use case | Endpoint flow |
|----------|---------------|
| Lunar date converter widget | POST `/calendar/lunar-date` with `date` for Gregorian to lunar, or with the three lunar fields for lunar to Gregorian |
| Lunar birthday reminders | Convert the birth date once to get the lunar date, then convert lunar to Gregorian each year to find the date it lands on |
| Festival calendar | Convert a fixed lunar date such as month 8 day 15 to Gregorian for every year you render |
| Leap month safe scheduling | Read `leapMonthOfYear`, and set `isLeapMonth` when you mean the second pass through a repeated month |
| Seasonal and solar term app | GET `/calendar/solar-terms/{year}`, sort by `instantUtc`, render `localDate` and `localTime` |
| Term boundary check | Compare a timestamp against the `instantUtc` of the surrounding `minor` terms to place it on the correct side of a month pillar change |
| Calendar month grid | Switch to `/calendar/monthly` for a whole month of lunisolar dates and almanac detail in one call |
| Almanac day view | Read `/calendar/day/{date}` for the day officer, the lunar mansion and the clash animal on a single date |

## Related endpoints in this domain

- `GET /chinese-astrology/calendar/solar-terms/{year}` (`listSolarTerms`) - the 24 solar terms for a solar year, Li Chun to Li Chun, each with the exact instant in UTC and at the reference meridian
- `GET /chinese-astrology/calendar/monthly` (`getMonthlyAlmanac`) - every day of one Gregorian month with its lunisolar date, pillars, day officer and mansion, plus the solar terms inside the month, in one call
- `GET /chinese-astrology/calendar/day/{date}` (`getAlmanacDay`) - the Tong Shu almanac view of a single day: lunisolar date, three pillars, day officer, lunar mansion, clash animal, and the activities the day favours or avoids
- `POST /chinese-astrology/calendar/auspicious-days` (`lookupAuspiciousDays`) - search a window of up to 93 days for the days a chosen activity is favoured on
- `POST /chinese-astrology/bazi/chart` (`generateBaziChart`) - the four pillars of a birth moment, with the school conventions typed as request parameters and echoed back

## Use this in your AI agent

Connect Claude, GPT, Gemini, or Cursor to RoxyAPI through the remote MCP server. No Docker. No self hosting. The full MCP tool catalog for this domain is at `https://roxyapi.com/mcp/chinese-astrology`.

```json
{
  "mcpServers": {
    "chinese-astrology": {
      "url": "https://roxyapi.com/mcp/chinese-astrology",
      "headers": { "X-API-Key": "$ROXY_API_KEY" }
    }
  }
}
```

The tool for this endpoint is `post_chinese_astrology_calendar_lunar_date`, and the solar terms tool is `get_chinese_astrology_calendar_solar_terms_year`.

See [docs/mcp](https://roxyapi.com/docs/mcp) for Claude Desktop, Cursor, Windsurf, VS Code, and Claude Code setup.

## For AI coding agents

This repo ships an [AGENTS.md](AGENTS.md) execution playbook. Cursor, Claude Code, Aider, Codex, Windsurf, RooCode, and Gemini CLI will pick it up automatically. Top level overview lives at [roxyapi.com/AGENTS.md](https://roxyapi.com/AGENTS.md).

## Resources

- [Methodology and gold standard tests](https://roxyapi.com/methodology)
- [Full API reference](https://roxyapi.com/api-reference) interactive Scalar UI
- [TypeScript SDK on npm](https://www.npmjs.com/package/@roxyapi/sdk)
- [Python SDK on PyPI](https://pypi.org/project/roxy-sdk/)
- [PHP SDK on Packagist](https://packagist.org/packages/roxyapi/sdk)
- [C# SDK on NuGet](https://www.nuget.org/packages/RoxyApi.Sdk)
- [Go SDK on pkg.go.dev](https://pkg.go.dev/github.com/RoxyAPI/sdk-go)
- [WordPress plugin](https://wordpress.org/plugins/roxyapi/)
- [llms.txt](https://roxyapi.com/llms.txt) full LLM citation index
- [Top level AGENTS.md](https://roxyapi.com/AGENTS.md)

## Other RoxyAPI samples

[![Human Design API](https://img.shields.io/badge/Human_Design_API-RoxyAPI-14b8a6?style=flat-square)](https://github.com/RoxyAPI/human-design-api)
[![Transit Forecast API](https://img.shields.io/badge/Transit_Forecast_API-RoxyAPI-14b8a6?style=flat-square)](https://github.com/RoxyAPI/transit-forecast-api)
[![Moon Phase API](https://img.shields.io/badge/Moon_Phase_API-RoxyAPI-14b8a6?style=flat-square)](https://github.com/RoxyAPI/moon-phase-api)
[![Biorhythm API](https://img.shields.io/badge/Biorhythm_API-RoxyAPI-14b8a6?style=flat-square)](https://github.com/RoxyAPI/biorhythm-api)
[![Tarot API](https://img.shields.io/badge/Tarot_API-RoxyAPI-14b8a6?style=flat-square)](https://github.com/RoxyAPI/tarot-api)

## License

MIT for this sample repo. See [LICENSE](LICENSE).

**Catalog licensing:** Personal and commercial use, including closed source proprietary apps. No AGPL or GPL entanglement. RoxyAPI APIs and SDKs are safe to embed in commercial products. Full terms at [roxyapi.com/policy/license](https://roxyapi.com/policy/license).

## Contact

- Site: [roxyapi.com](https://roxyapi.com)
- Status: [roxyapi.com/api-reference](https://roxyapi.com/api-reference)
