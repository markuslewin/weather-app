import {
  azureReverseGeocodingDir,
  deleteFixtureSettings,
  meteoForecastDir,
  meteoSearchDir,
  readFixtureSettings,
  writeFixtureSettings,
  type Settings,
} from "#tests/mocks/utils";
import type { TestFixture } from "@playwright/test";
import { test as baseTest } from "@playwright/test";

type SetMockSettings = (settings: Settings) => Promise<void>;

const createMockFixture = (
  dir: string
): TestFixture<SetMockSettings, object> => {
  // eslint-disable-next-line no-empty-pattern
  return async ({}, use) => {
    const original = await readFixtureSettings(dir);

    await use(async (settings) => {
      await writeFixtureSettings(dir, settings);
    });

    if (original === null) {
      await deleteFixtureSettings(dir);
    } else {
      await writeFixtureSettings(dir, original);
    }
  };
};

export const test = baseTest.extend<{
  setAzureReverseGeolocationSettings: SetMockSettings;
  setMeteoForecastSettings: SetMockSettings;
  setMeteoSearchSettings: SetMockSettings;
}>({
  setAzureReverseGeolocationSettings: createMockFixture(
    azureReverseGeocodingDir
  ),
  setMeteoForecastSettings: createMockFixture(meteoForecastDir),
  setMeteoSearchSettings: createMockFixture(meteoSearchDir),
});
