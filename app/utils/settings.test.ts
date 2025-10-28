import { countSystems, type Settings } from "#app/utils/settings";
import { expect, test } from "vitest";

test.each<[Settings, ReturnType<typeof countSystems>]>([
  [
    {
      precipitationUnit: "mm",
      temperatureUnit: "celsius",
      windSpeedUnit: "kmh",
    },
    {
      imperial: 0,
      metric: 3,
    },
  ],
  [
    {
      precipitationUnit: "inch",
      temperatureUnit: "fahrenheit",
      windSpeedUnit: "mph",
    },
    {
      imperial: 3,
      metric: 0,
    },
  ],
  [
    {
      precipitationUnit: "inch",
      temperatureUnit: "fahrenheit",
      windSpeedUnit: "kmh",
    },
    {
      imperial: 2,
      metric: 1,
    },
  ],
  [
    {
      precipitationUnit: "mm",
      temperatureUnit: "celsius",
      windSpeedUnit: "mph",
    },
    {
      imperial: 1,
      metric: 2,
    },
  ],
])("countSystems(%o) -> %o", (settings, expected) => {
  expect(countSystems(settings)).toStrictEqual(expected);
});
