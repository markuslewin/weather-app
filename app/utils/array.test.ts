import { hasValues } from "#app/utils/array";
import { expect, test } from "vitest";

test.each<[unknown[], boolean]>([
  [[], false],
  [[0], true],
  [[{ a: 1 }], true],
])("hasValues(%o) -> %s", (value, expected) => {
  expect(hasValues(value)).toBe(expected);
});
