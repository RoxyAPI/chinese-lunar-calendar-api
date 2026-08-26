"""
Chinese Lunar Calendar API: a lunar date converter that runs both ways through
one endpoint. Send a Gregorian date to convert forward, or send lunar_year,
lunar_month and lunar_day to convert back. The lunisolar calendar is evaluated
at a fixed UTC+8 reference meridian, so the same instant yields the same lunar
date anywhere in the world, and leap months are addressed explicitly rather
than inferred.
"""

import os

from roxy_sdk import create_roxy

roxy = create_roxy(os.environ["ROXY_API_KEY"])


def main():
    # 1. Gregorian to lunar
    forward = roxy.chinese_astrology.calculate_lunar_date(date="1990-06-15")
    lunar = forward["lunar"]

    print("Gregorian to lunar")
    print(f"  {forward['gregorianDate']} is lunar {lunar['year']}-{lunar['month']}-{lunar['day']}")
    print(f"  leap month: {lunar['isLeapMonth']}, month length: {lunar['monthLength']} days")
    print(f"  this lunisolar year repeats month: {forward.get('leapMonthOfYear', 'none')}")
    print(f"  reference offset: UTC+{forward['referenceOffset']}")

    # 2. Lunar to Gregorian
    back = roxy.chinese_astrology.calculate_lunar_date(
        lunar_year=1990, lunar_month=5, lunar_day=23
    )
    print("\nLunar to Gregorian")
    print(f"  lunar 1990-5-23 is {back['gregorianDate']}")

    # 3. The leap repetition of the same month number. 1990 has thirteen lunar
    # months, so month 5 comes round twice and only is_leap_month separates them.
    leap = roxy.chinese_astrology.calculate_lunar_date(
        lunar_year=1990, lunar_month=5, lunar_day=23, is_leap_month=True
    )
    print("\nThe leap month, addressed explicitly")
    print(f"  lunar 1990-5-23 first pass  {back['gregorianDate']}  ({back['lunar']['monthLength']} day month)")
    print(f"  lunar 1990-5-23 leap pass   {leap['gregorianDate']}  ({leap['lunar']['monthLength']} day month)")
    print("  A lunar birthday feature that ignores is_leap_month is a month out here.")

    # 4. The 24 solar terms of a solar year, each as an exact instant
    terms = roxy.chinese_astrology.list_solar_terms(year=2026)
    print(f"\nThe 24 solar terms of solar year {terms['year']}, total {terms['total']}")

    minor = sum(1 for t in terms["terms"] if t["type"] == "minor")
    print(f"  minor terms {minor}, major terms {len(terms['terms']) - minor}")

    for t in terms["terms"][:4]:
        print(
            f"  {t['id']:<11} {t['chinese']}  lon {t['longitude']:>3}  "
            f"{t['instantUtc']}  local {t['localDate']} {t['localTime']}"
        )

    li_chun = terms["terms"][0]
    print("\n  A term is an instant, not a date:")
    print(f"  {li_chun['name']} lands at {li_chun['instantUtc']} in UTC,")
    print(f"  which is {li_chun['localDate']} {li_chun['localTime']} at the reference meridian.")

    last = terms["terms"][-1]
    print("\n  The solar year runs Li Chun to Li Chun, so the last term,")
    print(f"  {last['name']}, is dated {last['localDate']}, inside the following January.")


if __name__ == "__main__":
    main()
