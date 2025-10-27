import { temperatureFormatter } from "#app/utils/format";
import { expect, test } from "vitest";

test.each<[number, string]>([
  [1, "1°"],
  [2.3, "2°"],
  [3.5, "4°"],
  [-1, "-1°"],
  [-1.7, "-2°"],
])("format(%i) -> %s", (value, expected) => {
  expect(temperatureFormatter.format(value)).toBe(expected);
});
