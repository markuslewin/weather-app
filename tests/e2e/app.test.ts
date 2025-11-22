import { createHomeUrl } from "#app/utils/url";
import { interpretationByCode, type Weather } from "#app/utils/weather";
import { test } from "#tests/playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";

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
  await setMeteoForecastSettings(null, { status: 500 });
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));

  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    /something went wrong/i
  );
});

test("location is unknown when reverse geolocation fails", async ({
  page,
  setAzureReverseGeolocationSettings,
}) => {
  await setAzureReverseGeolocationSettings({}, { status: 500 });
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));

  await expect(page.getByTestId("location")).toHaveText(/unknown/i);
});

test.only("shows random data", async ({ page, setMeteoForecastSettings }) => {
  await setMeteoForecastSettings(createWeather(), { status: 200 });
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));

  await expect(page).toHaveURL("/");
});

test.skip("can retry from error view", async ({
  page,
  setMeteoForecastSettings,
}) => {
  await setMeteoForecastSettings(null, { status: 500 });
  await page.goto("/");
  await setMeteoForecastSettings(createWeather(), { status: 200 });
  await page.getByRole("button", { name: "retry" }).click();

  // await expect()
});

const createTemperature = () => {
  return faker.number.float({ max: 50 });
};

const createWeatherCode = () => {
  // todo: Actually a string
  return parseInt(
    faker.helpers.objectKey(interpretationByCode) as unknown as string,
    10
  );
};

// todo: Revisit after fixing app logic
const getDate = (iso: string) => {
  return iso.substring(0, iso.indexOf("T"));
};
const removeZ = (iso: string) => {
  return iso.slice(0, iso.length - 1);
};

const createWeather = (overwrites?: Partial<Weather>): Weather => {
  const time = faker.date.anytime();
  const start = new Date(
    Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate())
  );
  return {
    current: {
      apparent_temperature: createTemperature(),
      precipitation: faker.number.float({ max: 1000 }),
      relative_humidity_2m: faker.number.int({ max: 100 }),
      temperature_2m: createTemperature(),
      time: time.toISOString(),
      weather_code: createWeatherCode(),
      wind_speed_10m: faker.number.float({ max: 100 }),
    },
    daily: {
      temperature_2m_max: faker.helpers.multiple(createTemperature, {
        count: 7,
      }),
      temperature_2m_min: faker.helpers.multiple(createTemperature, {
        count: 7,
      }),
      time: faker.helpers.multiple(
        (_, i) =>
          getDate(
            new Date(start.getTime() + i * 1000 * 60 * 60 * 24).toISOString()
          ),
        { count: 7 }
      ),
      weather_code: faker.helpers.multiple(createWeatherCode, { count: 7 }),
    },
    hourly: {
      temperature_2m: faker.helpers.multiple(createTemperature, {
        count: 24 * 7,
      }),
      time: faker.helpers.multiple(
        (_, i) =>
          removeZ(new Date(start.getTime() + i * 1000 * 60 * 60).toISOString()),
        { count: 24 * 7 }
      ),
      weather_code: faker.helpers.multiple(createWeatherCode, {
        count: 24 * 7,
      }),
    },
  };
};
