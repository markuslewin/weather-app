import type { Weather } from "#app/utils/weather";
import {
  azureReverseGeocodingDir,
  deleteFixture,
  meteoForecastDir,
  meteoSearchDir,
  writeFixture,
} from "#tests/mocks/utils";
import type {
  ErrorResponseOutput,
  GeocodingResponseOutput,
} from "@azure-rest/maps-search";
import type { TestFixture } from "@playwright/test";
import { test as baseTest } from "@playwright/test";

type SetMock<Body> = (body: Body, init: { status: number }) => Promise<void>;

const createMockFixture = <Body>(
  dir: string
): TestFixture<SetMock<Body>, object> => {
  // eslint-disable-next-line no-empty-pattern
  return async ({}, use) => {
    await use(async (body, init) => {
      await writeFixture(dir, { init, body });
    });

    await deleteFixture(dir);
  };
};

export const test = baseTest.extend<{
  setAzureReverseGeolocationSettings: SetMock<
    GeocodingResponseOutput | ErrorResponseOutput
  >;
  setMeteoForecastSettings: SetMock<Weather | null>;
  setMeteoSearchSettings: SetMock<unknown>;
}>({
  setAzureReverseGeolocationSettings: createMockFixture(
    azureReverseGeocodingDir
  ),
  setMeteoForecastSettings: createMockFixture(meteoForecastDir),
  setMeteoSearchSettings: createMockFixture(meteoSearchDir),
});
