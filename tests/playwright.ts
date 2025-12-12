import type { SearchResponse } from "#app/utils/search";
import { isSSRAttrName } from "#app/utils/ssr";
import type { WeatherResponse } from "#app/utils/weather";
import {
  azureReverseGeocodingDir,
  deleteFixture,
  getFixturePath,
  meteoForecastDir,
  meteoSearchDir,
  writeFixture,
} from "#tests/mocks/utils";
import type {
  ErrorResponseOutput,
  GeocodingResponseOutput,
} from "@azure-rest/maps-search";
import type { Page, TestFixture } from "@playwright/test";
import { test as baseTest } from "@playwright/test";

type SetMock<Body> = (body: Body, init: { status: number }) => Promise<void>;

const createMockFixture = <Body>(
  name: string,
  dir: string,
): TestFixture<SetMock<Body>, object> => {
  // eslint-disable-next-line no-empty-pattern
  return async ({}, use, testInfo) => {
    await use(async (body, init) => {
      await writeFixture(dir, { init, body });
    });

    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach(name, {
        contentType: "application/json",
        path: getFixturePath(dir),
      });
    }

    await deleteFixture(dir);
  };
};

export const test = baseTest.extend<{
  setAzureReverseGeocodingSettings: SetMock<
    GeocodingResponseOutput | ErrorResponseOutput
  >;
  setMeteoForecastSettings: SetMock<WeatherResponse | null>;
  setMeteoSearchSettings: SetMock<SearchResponse>;
}>({
  setAzureReverseGeocodingSettings: createMockFixture(
    "setAzureReverseGeocodingSettings",
    azureReverseGeocodingDir,
  ),
  setMeteoForecastSettings: createMockFixture(
    "setMeteoForecastSettings",
    meteoForecastDir,
  ),
  setMeteoSearchSettings: createMockFixture(
    "setMeteoSearchSettings",
    meteoSearchDir,
  ),
});

export const waitForHydration = (page: Page) => {
  return page.waitForSelector(`html[${isSSRAttrName}="false"]`, {
    state: "attached",
  });
};
