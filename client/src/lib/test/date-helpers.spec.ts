import {
  buildEntryPath,
  buildJourneyMonths,
  buildMonthPath,
  parseTravelDateParts,
} from "../date-helpers";

describe("date-helpers", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("builds month list from start date to current month", () => {
    const months = buildJourneyMonths("2024-02-03");

    expect(months).toEqual([
      { year: 2024, month: 2 },
      { year: 2024, month: 3 },
      { year: 2024, month: 4 },
      { year: 2024, month: 5 },
      { year: 2024, month: 6 },
    ]);
  });

  it("builds month and entry paths", () => {
    expect(buildMonthPath(2024, 6)).toBe("/journey/2024/06");
    expect(buildEntryPath(2024, 6, 4)).toBe("/journey/2024/06/04");
  });

  it("parses travel date parts", () => {
    expect(parseTravelDateParts("2024-11-03")).toEqual({
      year: 2024,
      month: 11,
      day: 3,
    });
  });
});
