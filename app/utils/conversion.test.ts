import {
  convertPrecipitation,
  convertTemperature,
  convertWindSpeed,
  toFahrenheit,
  toInches,
  toMilesPerHour,
} from "#app/utils/conversion";
import type {
  PrecipitationUnit,
  TemperatureUnit,
  WindSpeedUnit,
} from "#app/utils/settings";
import { expect, test } from "vitest";

test.each([
  [0, 0],
  [100, 3.937007874015748],
])("toInches(%i) -> %i", (mm, expected) => {
  expect(toInches(mm)).toBe(expected);
});

test.each<[PrecipitationUnit, number, number]>([
  ["mm", 100, 100],
  ["inch", 100, 3.937007874015748],
])("convertPrecipitation(%s, %i) -> %i", (unit, celsius, expected) => {
  expect(convertPrecipitation(unit, celsius)).toBe(expected);
});

test.each([
  [0, 32],
  [1, 33.8],
  [2, 35.6],
  [-1, 30.2],
  [100, 212],
  [-100, -148],
])("toFahrenheit(%i) -> %i", (celsius, expected) => {
  expect(toFahrenheit(celsius)).toBe(expected);
});

test.each<[TemperatureUnit, number, number]>([
  ["celsius", 0, 0],
  ["fahrenheit", 0, 32],
])("convertTemperature(%s, %i) -> %i", (unit, celsius, expected) => {
  expect(convertTemperature(unit, celsius)).toBe(expected);
});

test.each([
  [0, 0],
  [100, 62.15040397762586],
])("toMilesPerHour(%i) -> %i", (kmh, expected) => {
  expect(toMilesPerHour(kmh)).toBe(expected);
});

test.each<[WindSpeedUnit, number, number]>([
  ["kmh", 100, 100],
  ["mph", 100, 62.15040397762586],
])("convertWindSpeed(%s, %i) -> %i", (unit, celsius, expected) => {
  expect(convertWindSpeed(unit, celsius)).toBe(expected);
});
