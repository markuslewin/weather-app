import { test as baseTest, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import {
  deleteFixtureSettings,
  meteoForecastDir,
  readFixtureSettings,
  writeFixtureSettings,
  type Settings,
} from "#tests/mocks/utils";
import { createHomeUrl } from "#app/utils/url";

const test = baseTest.extend<{
  setMeteoForecastSettings: (settings: Settings) => Promise<void>;
}>({
  // eslint-disable-next-line no-empty-pattern
  setMeteoForecastSettings: async ({}, use) => {
    const originalSettings = await readFixtureSettings(meteoForecastDir);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(async (settings) => {
      await writeFixtureSettings(meteoForecastDir, settings);
    });

    if (originalSettings === null) {
      await deleteFixtureSettings(meteoForecastDir);
    } else {
      await writeFixtureSettings(meteoForecastDir, originalSettings);
    }
  },
});

test("passes a11y check", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test("defaults to metric", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "units",
    })
    .click();

  await expect(
    page
      .getByRole("radiogroup", { name: "temperature" })
      .getByRole("radio", { name: "celsius" })
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "wind speed" })
      .getByRole("radio", { name: "km/h" })
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "precipitation" })
      .getByRole("radio", { name: "millimeters" })
  ).toBeChecked();
});

test("toggles measurement system", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "units",
    })
    .click();
  await page.getByRole("button", { name: "switch to imperial" }).click();

  await expect(
    page
      .getByRole("radiogroup", { name: "temperature" })
      .getByRole("radio", { name: "fahrenheit" })
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "wind speed" })
      .getByRole("radio", { name: "mph" })
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "precipitation" })
      .getByRole("radio", { name: "inches" })
  ).toBeChecked();

  await page.getByRole("button", { name: "switch to metric" }).click();

  await expect(
    page
      .getByRole("radiogroup", { name: "temperature" })
      .getByRole("radio", { name: "celsius" })
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "wind speed" })
      .getByRole("radio", { name: "km/h" })
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "precipitation" })
      .getByRole("radio", { name: "millimeters" })
  ).toBeChecked();
});

test("switches toggle button text", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "units",
    })
    .click();

  await expect(
    page.getByRole("button", { name: "switch to imperial" })
  ).toBeVisible();

  await page
    .getByRole("radiogroup", { name: "temperature" })
    .getByRole("radio", { name: "fahrenheit" })
    .check({ force: true });

  await expect(
    page.getByRole("button", { name: "switch to imperial" })
  ).toBeVisible();

  await page
    .getByRole("radiogroup", { name: "precipitation" })
    .getByRole("radio", { name: "inches" })
    .check({ force: true });

  await expect(
    page.getByRole("button", { name: "switch to metric" })
  ).toBeVisible();

  await page
    .getByRole("radiogroup", { name: "temperature" })
    .getByRole("radio", { name: "celsius" })
    .check({ force: true });
  await page
    .getByRole("radiogroup", { name: "wind speed" })
    .getByRole("radio", { name: "mph" })
    .check({ force: true });
  await page
    .getByRole("radiogroup", { name: "precipitation" })
    .getByRole("radio", { name: "millimeters" })
    .check({ force: true });

  await expect(
    page.getByRole("button", { name: "switch to imperial" })
  ).toBeVisible();
});

test("shows initial view", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    /the sky looking today/i
  );
});

test("shows error view when forecast fails", async ({
  page,
  setMeteoForecastSettings,
}) => {
  await setMeteoForecastSettings({ type: "error" });
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));

  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    /something went wrong/i
  );
});

test.skip("can retry from error view", async ({
  page,
  setMeteoForecastSettings,
}) => {
  await setMeteoForecastSettings({ type: "error" });
  await page.goto("/");
  await setMeteoForecastSettings({ type: "json", fixture: "figma" });
  await page.getByRole("button", { name: "retry" }).click();

  // await expect()
});
