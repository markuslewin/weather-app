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

test("displays current weather data", async ({
  page,
  setMeteoForecastSettings,
}) => {
  const apparent_temperature = 10.7;
  const precipitation = 123.4;
  const relative_humidity_2m = 28;
  const temperature_2m = 22.3;
  const time = "2025-11-27T00:55";
  const weather_code = 71;
  const wind_speed_10m = 55.5;

  await setMeteoForecastSettings(
    createWeather({
      current: {
        apparent_temperature,
        precipitation,
        relative_humidity_2m,
        temperature_2m,
        time,
        weather_code,
        wind_speed_10m,
      },
    }),
    { status: 200 }
  );
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));

  await expect(page.getByTestId("feels-like")).toHaveText("11°");
  await expect(page.getByTestId("precipitation")).toHaveText("123 mm");
  await expect(page.getByTestId("humidity")).toHaveText("28%");
  await expect(page.getByTestId("temperature")).toHaveText("22°");
  await expect(page.getByTestId("time")).toHaveText(
    "Thursday, November 27, 2025"
  );
  await expect(page.getByTestId("weather-code")).toHaveAccessibleName(/snow/i);
  await expect(page.getByTestId("wind")).toHaveText("56 km/h");
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
  return faker.helpers.arrayElement([...interpretationByCode.keys()]);
};

// todo: Revisit after fixing app logic
const getDate = (iso: string) => {
  return iso.substring(0, iso.indexOf("T"));
};
const removeZ = (iso: string) => {
  return iso.slice(0, iso.length - 1);
};

// Source - https://stackoverflow.com/a/51365037
// Posted by Jeffrey Patterson, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-27, License - CC BY-SA 4.0
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

const createWeather = (overwrites?: RecursivePartial<Weather>): Weather => {
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
      ...overwrites?.current,
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
      ...overwrites?.daily,
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
      ...overwrites?.hourly,
    },
  };
};
