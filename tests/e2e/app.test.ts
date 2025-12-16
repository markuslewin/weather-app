import type { SearchResponse, SearchResponseItem } from "#app/utils/search";
import { createHomeUrl } from "#app/utils/url";
import { interpretationByCode, type WeatherResponse } from "#app/utils/weather";
import { test, waitForHydration } from "#tests/playwright";
import { AxeBuilder } from "@axe-core/playwright";
import type {
  FeaturesItemOutput,
  GeocodingResponseOutput,
} from "@azure-rest/maps-search";
import { faker } from "@faker-js/faker";
import { expect } from "@playwright/test";

const dailyLength = 7;
const hourlyLength = 24 * dailyLength;

test("initial view passes a11y check", async ({ page }) => {
  await page.goto(createHomeUrl());

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test("weather view passes a11y check", async ({
  page,
  setAzureReverseGeocodingSettings,
}) => {
  const reverseGeocoding = createReverseGeocoding();

  await setAzureReverseGeocodingSettings(reverseGeocoding, { status: 200 });
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));
  await page
    .getByRole("heading", {
      name: reverseGeocoding.features?.[0]?.properties?.address?.locality,
    })
    .waitFor();

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test("error view passes a11y check", async ({
  page,
  setMeteoForecastSettings,
}) => {
  await setMeteoForecastSettings(null, { status: 500 });
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));
  await page.getByRole("heading", { name: "something went wrong" }).waitFor();

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});

test("logo takes user to initial view", async ({
  page,
  setMeteoForecastSettings,
}) => {
  await setMeteoForecastSettings(null, { status: 500 });
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));
  await page.getByRole("link", { name: "weather now" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    /the sky looking today/i,
  );
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
      .getByRole("radio", { name: "celsius" }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "wind speed" })
      .getByRole("radio", { name: "km/h" }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "precipitation" })
      .getByRole("radio", { name: "millimeters" }),
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
      .getByRole("radio", { name: "fahrenheit" }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "wind speed" })
      .getByRole("radio", { name: "mph" }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "precipitation" })
      .getByRole("radio", { name: "inches" }),
  ).toBeChecked();

  await page.getByRole("button", { name: "switch to metric" }).click();

  await expect(
    page
      .getByRole("radiogroup", { name: "temperature" })
      .getByRole("radio", { name: "celsius" }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "wind speed" })
      .getByRole("radio", { name: "km/h" }),
  ).toBeChecked();
  await expect(
    page
      .getByRole("radiogroup", { name: "precipitation" })
      .getByRole("radio", { name: "millimeters" }),
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
    page.getByRole("button", { name: "switch to imperial" }),
  ).toBeVisible();

  await page
    .getByRole("radiogroup", { name: "temperature" })
    .getByRole("radio", { name: "fahrenheit" })
    .check({ force: true });

  await expect(
    page.getByRole("button", { name: "switch to imperial" }),
  ).toBeVisible();

  await page
    .getByRole("radiogroup", { name: "precipitation" })
    .getByRole("radio", { name: "inches" })
    .check({ force: true });

  await expect(
    page.getByRole("button", { name: "switch to metric" }),
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
    page.getByRole("button", { name: "switch to imperial" }),
  ).toBeVisible();
});

test("shows initial view", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    /the sky looking today/i,
  );
});

test("shows error view when forecast fails", async ({
  page,
  setMeteoForecastSettings,
}) => {
  await setMeteoForecastSettings(null, { status: 500 });
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));

  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    /something went wrong/i,
  );
});

test("shows location", async ({ page, setAzureReverseGeocodingSettings }) => {
  await setAzureReverseGeocodingSettings(
    createReverseGeocoding({
      features: [
        createFeaturesItem({
          properties: {
            address: {
              locality: "Stockholm",
              countryRegion: { name: "Sweden" },
            },
          },
        }),
      ],
    }),
    {
      status: 200,
    },
  );
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));

  await expect(page.getByTestId("location")).toHaveText(/stockholm, sweden/i);
});

test("location is unknown when reverse geocoding fails", async ({
  page,
  setAzureReverseGeocodingSettings,
}) => {
  await setAzureReverseGeocodingSettings({}, { status: 500 });
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
    { status: 200 },
  );
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));

  await expect(page.getByTestId("feels-like")).toHaveText("11°");
  await expect(page.getByTestId("precipitation")).toHaveText("123 mm");
  await expect(page.getByTestId("humidity")).toHaveText("28%");
  await expect(page.getByTestId("temperature")).toHaveText("22°");
  await expect(page.getByTestId("time")).toHaveText(
    "Thursday, November 27, 2025",
  );
  await expect(page.getByTestId("weather-code")).toHaveAccessibleName(/snow/i);
  await expect(page.getByTestId("wind")).toHaveText("56 km/h");
});

test.skip("displays daily forecast", async ({ page }) => {
  // todo: Implement `now`
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));
});

// todo: Integration test
test("displays suggestions when searching", async ({
  page,
  setMeteoSearchSettings,
}) => {
  const results = faker.helpers.multiple(() => createSearchResponseItem());

  await setMeteoSearchSettings(
    createSearchResponse({
      results,
    }),
    { status: 200 },
  );
  await page.goto(createHomeUrl());
  await waitForHydration(page);
  await page
    .getByRole("combobox", { name: "search" })
    .fill(faker.location.city());

  await expect(
    page.getByRole("listbox", { name: "suggestions" }).getByRole("option"),
  ).toHaveText(results.map((r) => r.name));
});

test("displays message when no suggestions where found", async ({
  page,
  setMeteoSearchSettings,
}) => {
  await setMeteoSearchSettings(
    createSearchResponse({
      results: [],
    }),
    { status: 200 },
  );
  await page.goto(createHomeUrl());
  await waitForHydration(page);
  await page
    .getByRole("combobox", { name: "search" })
    .fill(faker.location.city());

  await expect(
    page.getByRole("listbox", { name: "suggestions" }).getByRole("option"),
  ).toHaveText(["No suggestions"]);
});

test("navigates to coordinates when selecting a suggestion", async ({
  page,
  setMeteoSearchSettings,
}) => {
  const item = createSearchResponseItem();

  await setMeteoSearchSettings(
    createSearchResponse({
      results: [item],
    }),
    { status: 200 },
  );
  await page.goto(createHomeUrl());
  await waitForHydration(page);
  await page
    .getByRole("combobox", { name: "search" })
    .fill(faker.location.city());
  await page
    .getByRole("listbox", { name: "suggestions" })
    .getByRole("option", { name: item.name })
    .click();

  await expect(page).toHaveURL(
    `/?${new URLSearchParams({
      lat: `${item.latitude}`,
      lon: `${item.longitude}`,
    })}`,
  );
});

test("can search without selecting a suggestion", async ({
  page,
  setMeteoSearchSettings,
}) => {
  const first = createSearchResponseItem();
  const second = createSearchResponseItem();

  await setMeteoSearchSettings(
    createSearchResponse({
      results: [first, second],
    }),
    { status: 200 },
  );
  await page.goto(createHomeUrl());
  await waitForHydration(page);
  await page
    .getByRole("combobox", { name: "search" })
    .fill(faker.location.city());
  // `ComboBox` prevents form submissions when menu is open. Close menu before submitting the form
  await page.getByRole("combobox", { name: "search" }).press("Escape");
  await page.getByRole("combobox", { name: "search" }).press("Enter");

  await expect(page).toHaveURL(
    `/?${new URLSearchParams({
      lat: `${first.latitude}`,
      lon: `${first.longitude}`,
    })}`,
  );
});

test("can search by button", async ({ page, setMeteoSearchSettings }) => {
  const first = createSearchResponseItem();
  const second = createSearchResponseItem();

  await setMeteoSearchSettings(
    createSearchResponse({
      results: [first, second],
    }),
    { status: 200 },
  );
  await page.goto(createHomeUrl());
  await waitForHydration(page);
  await page
    .getByRole("combobox", { name: "search" })
    .fill(faker.location.city());
  // `ComboBox` hides outside elements when it's open. Close `Popover` before attempting to click the search button
  await page.getByRole("combobox", { name: "search" }).press("Escape");
  await page.getByRole("button", { name: "search" }).click();

  await expect(page).toHaveURL(
    `/?${new URLSearchParams({
      lat: `${first.latitude}`,
      lon: `${first.longitude}`,
    })}`,
  );
});

test("can retry from error view", async ({
  page,
  setMeteoForecastSettings,
}) => {
  await setMeteoForecastSettings(null, { status: 500 });
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));
  await setMeteoForecastSettings(createWeather(), { status: 200 });
  await page.getByRole("button", { name: "retry" }).click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    /the sky looking today/i,
  );
});

test("converts temperature", async ({ page, setMeteoForecastSettings }) => {
  const celsius = 10;
  const fahrenheit = 50;

  await setMeteoForecastSettings(
    createWeather({
      current: {
        apparent_temperature: celsius,
        temperature_2m: celsius,
      },
      daily: {
        temperature_2m_max: Array.from({ length: dailyLength }, () => celsius),
        temperature_2m_min: Array.from({ length: dailyLength }, () => celsius),
      },
      hourly: {
        temperature_2m: Array.from({ length: hourlyLength }, () => celsius),
      },
    }),
    { status: 200 },
  );
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));
  await page.getByRole("button", { name: "units" }).click();
  await page
    .getByRole("radiogroup", { name: "temperature" })
    .getByRole("radio", { name: "fahrenheit" })
    .check({ force: true });
  await page.getByRole("dialog", { name: "unit settings" }).press("Escape");

  await expect(page.getByTestId("temperature")).toHaveText(`${fahrenheit}°`);
  await expect(page.getByTestId("feels-like")).toHaveText(`${fahrenheit}°`);
  await expect(page.getByTestId("day-temperature-max")).toHaveText(
    Array.from({ length: dailyLength }, () => `${fahrenheit}°`),
  );
  await expect(page.getByTestId("day-temperature-min")).toHaveText(
    Array.from({ length: dailyLength }, () => `${fahrenheit}°`),
  );
  // todo: Fix after "now" has been implemented
  // await expect(page.getByTestId("day-temperature-min")).toHaveText(
  //   Array.from({ length: hourlyLength }, () => `${fahrenheit}°`)
  // );
});

test("converts wind speed", async ({ page, setMeteoForecastSettings }) => {
  await setMeteoForecastSettings(
    createWeather({
      current: {
        wind_speed_10m: 10,
      },
    }),
    { status: 200 },
  );
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));
  await page.getByRole("button", { name: "units" }).click();
  await page
    .getByRole("radiogroup", { name: "wind speed" })
    .getByRole("radio", { name: "mph" })
    .check({ force: true });
  await page.getByRole("dialog", { name: "unit settings" }).press("Escape");

  await expect(page.getByTestId("wind")).toHaveText("6 mph");
});

test("converts precipitation", async ({ page, setMeteoForecastSettings }) => {
  await setMeteoForecastSettings(
    createWeather({
      current: {
        precipitation: 100,
      },
    }),
    { status: 200 },
  );
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));
  await page.getByRole("button", { name: "units" }).click();
  await page
    .getByRole("radiogroup", { name: "precipitation" })
    .getByRole("radio", { name: "inches" })
    .check({ force: true });
  await page.getByRole("dialog", { name: "unit settings" }).press("Escape");

  await expect(page.getByTestId("precipitation")).toHaveText("4 in");
});

test.skip("filters hourly temperature", async ({ page }) => {
  await page.goto(createHomeUrl({ lat: "0", lon: "0" }));
  await page.getByRole("button", { name: "select date" }).click();
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

const createWeather = (
  overwrites?: RecursivePartial<WeatherResponse>,
): WeatherResponse => {
  const time = faker.date.anytime();
  const start = new Date(
    Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate()),
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
        count: dailyLength,
      }),
      temperature_2m_min: faker.helpers.multiple(createTemperature, {
        count: dailyLength,
      }),
      time: faker.helpers.multiple(
        (_, i) =>
          getDate(
            new Date(start.getTime() + i * 1000 * 60 * 60 * 24).toISOString(),
          ),
        { count: dailyLength },
      ),
      weather_code: faker.helpers.multiple(createWeatherCode, {
        count: dailyLength,
      }),
      ...overwrites?.daily,
    },
    hourly: {
      temperature_2m: faker.helpers.multiple(createTemperature, {
        count: hourlyLength,
      }),
      time: faker.helpers.multiple(
        (_, i) =>
          removeZ(new Date(start.getTime() + i * 1000 * 60 * 60).toISOString()),
        { count: hourlyLength },
      ),
      weather_code: faker.helpers.multiple(createWeatherCode, {
        count: hourlyLength,
      }),
      ...overwrites?.hourly,
    },
  };
};

const createFeaturesItem = (
  overwrites?: Partial<FeaturesItemOutput>,
): FeaturesItemOutput => {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [faker.location.longitude(), faker.location.latitude()],
      ...overwrites?.geometry,
    },
    properties: {
      address: {
        locality: faker.location.city(),
        ...overwrites?.properties?.address,
        countryRegion: {
          name: faker.location.country(),
          ...overwrites?.properties?.address?.countryRegion,
        },
      },
    },
  };
};

const createReverseGeocoding = (
  overwrites?: Partial<GeocodingResponseOutput>,
): GeocodingResponseOutput => {
  return {
    type: "FeatureCollection",
    features: faker.helpers.multiple(() => createFeaturesItem(), { count: 3 }),
    ...overwrites,
  };
};

const createSearchResponseItem = (
  overwrites?: Partial<SearchResponseItem>,
): SearchResponseItem => {
  return {
    id: faker.number.int(),
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
    name: faker.location.city(),
    ...overwrites,
  };
};

const createSearchResponse = (
  overwrites?: Partial<SearchResponse>,
): SearchResponse => {
  return {
    results: faker.helpers.multiple(() => createSearchResponseItem(), {
      count: 3,
    }),
    ...overwrites,
  };
};
