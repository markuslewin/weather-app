import { Icon } from "#app/components/icon";
import { WeatherIcon } from "#app/components/weather-icon";
import {
  convertPrecipitation,
  convertTemperature,
  convertWindSpeed,
} from "#app/utils/conversion";
import {
  createPrecipitationFormatter,
  createWindSpeedFormatter,
  formatDate,
  formatDay,
  formatHours,
  percentageFormatter,
  temperatureFormatter,
} from "#app/utils/format";
import { searchResultSchema, type SearchResultItem } from "#app/utils/search";
import {
  countSystems,
  precipitationUnitSchema,
  temperatureUnitSchema,
  windSpeedUnitSchema,
  type PrecipitationUnit,
  type Settings,
  type TemperatureUnit,
  type WindSpeedUnit,
} from "#app/utils/settings";
import { getInterpretation, getWeather } from "#app/utils/weather";
import { useId, useState } from "react";
import {
  Button,
  ComboBox,
  Dialog,
  DialogTrigger,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Radio,
  RadioGroup,
  Select,
  SelectionIndicator,
  SelectValue,
  type ButtonProps,
} from "react-aria-components";
import { Form, Link, useNavigate, useNavigation } from "react-router";
import { useAsyncList } from "react-stately";
import type { Route } from "./+types/home";

export async function loader() {
  const location = "Berlin, Germany";
  const weather = await getWeather();
  return { location, weather };
}

export default function Home({
  loaderData: { location, weather },
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const searchHeadingId = useId();
  const [settings, setSettings] = useState<Settings>({
    temperatureUnit: "celsius",
    windSpeedUnit: "kmh",
    precipitationUnit: "mm",
  });
  const defaultDate = weather.hourly[0]!.time.split("T")[0]!;
  const dates = [
    ...new Set(
      weather.hourly.map((hour) => {
        return hour.time.split("T")[0]!;
      })
    ),
  ];
  const [date, setDate] = useState(defaultDate);
  const list = useAsyncList<SearchResultItem>({
    load: async ({ signal, filterText = "" }) => {
      const response = await fetch(
        `/api/search?${new URLSearchParams({ name: filterText })}`,
        { signal }
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const json = await response.json();
      if (signal.aborted) {
        throw new Error("Aborted during JSON parse");
      }
      return searchResultSchema.parse(json);
    },
  });

  const temperature = (value: number) => {
    return temperatureFormatter.format(
      convertTemperature(settings.temperatureUnit, value)
    );
  };

  const windSpeed = (value: number) => {
    return createWindSpeedFormatter(settings.windSpeedUnit).format(
      convertWindSpeed(settings.windSpeedUnit, value)
    );
  };

  const precipitation = (value: number) => {
    return createPrecipitationFormatter(settings.precipitationUnit).format(
      convertPrecipitation(settings.precipitationUnit, value)
    );
  };

  const settingsCount = countSystems(settings);
  const switchButtonProps: ButtonProps =
    settingsCount.metric < settingsCount.imperial
      ? {
          children: "Switch to Metric",
          onPress: () => {
            setSettings({
              precipitationUnit: "mm",
              temperatureUnit: "celsius",
              windSpeedUnit: "kmh",
            });
          },
        }
      : {
          children: "Switch to Imperial",
          onPress: () => {
            setSettings({
              precipitationUnit: "inch",
              temperatureUnit: "fahrenheit",
              windSpeedUnit: "mph",
            });
          },
        };

  const currentWeatherInterpretation = getInterpretation(
    weather.current.weather_code
  );

  return (
    <>
      <header className="[ header ] [ center ]">
        <div className="cluster">
          <Link to={"/"}>
            <img alt="Weather Now" src="/images/logo.svg" />
          </Link>
          <DialogTrigger>
            <Button className="units-button">
              <Icon name="IconUnits" />
              Units
              <Icon name="IconDropdown" />
            </Button>
            <Popover placement="bottom end" offset={10}>
              <Dialog
                className="[ units-dialog ] [ stack ] [ layer-1 ]"
                aria-label="Unit settings"
              >
                <Button className="dropdown-button" {...switchButtonProps} />
                <RadioGroup
                  className="[ units-dialog__group ] [ stack ]"
                  value={settings.temperatureUnit}
                  onChange={(value) => {
                    const temperatureUnit = temperatureUnitSchema.parse(value);
                    setSettings({ ...settings, temperatureUnit });
                  }}
                >
                  <Label className="units-dialog__group-label">
                    Temperature
                  </Label>
                  <div className="[ units-dialog__radios ] [ stack ]">
                    <Radio
                      className="dropdown-button"
                      value={"celsius" satisfies TemperatureUnit}
                    >
                      <span>
                        Celsius<span aria-hidden="true"> (°C)</span>
                      </span>
                      <SelectionIndicator>
                        <Icon
                          className="dropdown-button__icon"
                          name="IconCheckmark"
                        />
                      </SelectionIndicator>
                    </Radio>
                    <Radio
                      className="dropdown-button"
                      value={"fahrenheit" satisfies TemperatureUnit}
                    >
                      <span>
                        Fahrenheit<span aria-hidden="true"> (°F)</span>
                      </span>
                      <SelectionIndicator>
                        <Icon
                          className="dropdown-button__icon"
                          name="IconCheckmark"
                        />
                      </SelectionIndicator>
                    </Radio>
                  </div>
                </RadioGroup>
                <div className="separator" />
                <RadioGroup
                  className="[ units-dialog__group ] [ stack ]"
                  value={settings.windSpeedUnit}
                  onChange={(value) => {
                    const windSpeedUnit = windSpeedUnitSchema.parse(value);
                    setSettings({ ...settings, windSpeedUnit });
                  }}
                >
                  <Label className="units-dialog__group-label">
                    Wind Speed
                  </Label>
                  <div className="[ units-dialog__radios ] [ stack ]">
                    <Radio
                      className="dropdown-button"
                      value={"kmh" satisfies WindSpeedUnit}
                    >
                      km/h
                      <SelectionIndicator>
                        <Icon
                          className="dropdown-button__icon"
                          name="IconCheckmark"
                        />
                      </SelectionIndicator>
                    </Radio>
                    <Radio
                      className="dropdown-button"
                      value={"mph" satisfies WindSpeedUnit}
                    >
                      mph
                      <SelectionIndicator>
                        <Icon
                          className="dropdown-button__icon"
                          name="IconCheckmark"
                        />
                      </SelectionIndicator>
                    </Radio>
                  </div>
                </RadioGroup>
                <div className="separator" />
                <RadioGroup
                  className="[ units-dialog__group ] [ stack ]"
                  value={settings.precipitationUnit}
                  onChange={(value) => {
                    const precipitationUnit =
                      precipitationUnitSchema.parse(value);
                    setSettings({ ...settings, precipitationUnit });
                  }}
                >
                  <Label className="units-dialog__group-label">
                    Precipitation
                  </Label>
                  <div className="[ units-dialog__radios ] [ stack ]">
                    <Radio
                      className="dropdown-button"
                      value={"mm" satisfies PrecipitationUnit}
                    >
                      <span>
                        Millimeters<span aria-hidden="true"> (mm)</span>
                      </span>
                      <SelectionIndicator>
                        <Icon
                          className="dropdown-button__icon"
                          name="IconCheckmark"
                        />
                      </SelectionIndicator>
                    </Radio>
                    <Radio
                      className="dropdown-button"
                      value={"inch" satisfies PrecipitationUnit}
                    >
                      <span>
                        Inches<span aria-hidden="true"> (in)</span>
                      </span>
                      <SelectionIndicator>
                        <Icon
                          className="dropdown-button__icon"
                          name="IconCheckmark"
                        />
                      </SelectionIndicator>
                    </Radio>
                  </div>
                </RadioGroup>
              </Dialog>
            </Popover>
          </DialogTrigger>
        </div>
      </header>
      <main className="[ center ] [ mt-600 tablet:mt-800 ]">
        <div>
          <h1 className="text-preset-2 text-center">
            How’s the sky looking today?
          </h1>
          <section
            className="[ search ] [ center ] [ mt-600 tablet:mt-800 ]"
            aria-labelledby={searchHeadingId}
          >
            <h2 className="sr-only" id={searchHeadingId}>
              Search
            </h2>
            <Form className="search__form">
              <ComboBox
                className="search-combobox"
                aria-label="Search for a place"
                allowsCustomValue
                allowsEmptyCollection
                inputValue={list.filterText}
                onInputChange={(value) => {
                  list.setFilterText(value);
                }}
                onSelectionChange={(key) => {
                  if (key === null) return;

                  const item = list.getItem(key);
                  if (item === undefined) return;

                  void navigate(
                    `/?${new URLSearchParams({
                      lon: item.longitude.toString(),
                      lat: item.latitude.toString(),
                    })}`
                  );
                }}
                items={list.items}
              >
                <div className="search-input">
                  <Input
                    className="search-input__input"
                    name="q"
                    placeholder="Search for a place..."
                  />
                  <Icon className="search-input__icon" name="IconSearch" />
                </div>
                <Popover className="search-combobox__popover" offset={10}>
                  <ListBox
                    renderEmptyState={() => (
                      <div className="search-combobox__empty-state">
                        {list.isLoading ? (
                          <>
                            <Icon name="IconLoading" /> Search in progress
                          </>
                        ) : (
                          "No recommendations"
                        )}
                      </div>
                    )}
                  >
                    {(item: SearchResultItem) => (
                      <ListBoxItem>{item.name}</ListBoxItem>
                    )}
                  </ListBox>
                </Popover>
              </ComboBox>
              <button className="primary-button">
                {navigation.state === "idle" ? "Search" : "Searching..."}
              </button>
            </Form>
          </section>
          <div className="[ dashboard ] [ mt-400 desktop:600 ]">
            <div>
              <div className="current">
                <div className="card">
                  <div>
                    <h2 className="text-preset-4">{location}</h2>
                    <h3 className="sr-only">Current weather</h3>
                    <p className="mt-150">
                      {formatDate(new Date(weather.current.time))}
                    </p>
                  </div>
                  <div className="card__weather">
                    {currentWeatherInterpretation ? (
                      <WeatherIcon
                        className="card__weather-icon"
                        interpretation={currentWeatherInterpretation}
                      />
                    ) : null}
                    <p className="text-preset-1">
                      {temperature(weather.current.temperature_2m)}
                    </p>
                  </div>
                </div>
                <div className="[ grid ] [ mt-250 desktop:mt-400 ]">
                  {[
                    {
                      key: "Feels Like",
                      value: temperature(weather.current.apparent_temperature),
                    },
                    {
                      key: "Humidity",
                      value: percentageFormatter.format(
                        weather.current.relative_humidity_2m
                      ),
                    },
                    {
                      key: "Wind",
                      value: windSpeed(weather.current.wind_speed_10m),
                    },
                    {
                      key: "Precipitation",
                      value: precipitation(weather.current.precipitation),
                    },
                  ].map(({ key, value }) => {
                    return (
                      <div className="[ box ] [ layer-1 radius-12 ]" key={key}>
                        <h4>{key}</h4>
                        <p className="mt-300 text-preset-3">{value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="[ daily ] [ mt-400 desktop:mt-600 ]">
                <h3 className="text-preset-5">Daily forecast</h3>
                <ol className="[ grid ] [ mt-250 ]" role="list">
                  {weather.daily.map((day) => {
                    const interpretation = getInterpretation(day.weather_code);
                    return (
                      <li
                        className="[ daily__day ] [ box stack ] [ layer-1 radius-12 ]"
                        key={day.time}
                      >
                        <h4 className="text-center">
                          {formatDay("short", new Date(day.time))}
                        </h4>
                        {interpretation ? (
                          <WeatherIcon
                            className="[ day__icon ] [ size-60 ]"
                            interpretation={interpretation}
                          />
                        ) : (
                          <div className="size-60" />
                        )}
                        <div className="day__temperature">
                          <p className="text-preset-7">
                            <span className="sr-only">Max temperature: </span>
                            {temperature(day.temperature_2m_max)}
                          </p>
                          <p className="text-preset-7">
                            <span className="sr-only">Min temperature: </span>
                            {temperature(day.temperature_2m_min)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
            <article className="[ hourly ] [ box ] [ layer-1 radius-20 ]">
              <header className="cluster">
                <h3 className="text-preset-5">Hourly forecast</h3>
                <Select
                  className="date-select"
                  value={date}
                  onChange={(value) => {
                    setDate(
                      typeof value === "string" && dates.includes(value)
                        ? value
                        : defaultDate
                    );
                  }}
                  aria-label="Select date"
                >
                  <Button>
                    <SelectValue />
                    <Icon name="IconDropdown" />
                  </Button>
                  <Popover
                    className="date-select__popover"
                    offset={10}
                    placement="bottom end"
                  >
                    <ListBox items={dates.map((id) => ({ id }))}>
                      {(hour) => (
                        <ListBoxItem>
                          {formatDay("long", new Date(hour.id))}
                        </ListBoxItem>
                      )}
                    </ListBox>
                  </Popover>
                </Select>
              </header>
              <ol className="[ hours ] [ stack ] [ mt-200 ]" role="list">
                {weather.hourly
                  .filter((hour) => {
                    // todo: Real today
                    const isToday = hour.time.split("T")[0] === date;
                    const hourPart = Number(
                      hour.time.split("T")[1]!.slice(0, 2)
                    );
                    return isToday && 15 <= hourPart && hourPart <= 22;
                  })
                  .map((hour) => {
                    const interpretation = getInterpretation(hour.weather_code);
                    return (
                      <li
                        className="[ hours__item ] [ box ] [ layer-2 radius-8 ]"
                        key={hour.time}
                      >
                        <h4 className="text-preset-5--medium">
                          {formatHours(new Date(hour.time))}
                        </h4>
                        {interpretation ? (
                          <WeatherIcon
                            className="size-40"
                            interpretation={interpretation}
                          />
                        ) : (
                          <div className="size-40" />
                        )}
                        <p className="text-preset-7">
                          {temperature(hour.temperature_2m)}
                        </p>
                      </li>
                    );
                  })}
              </ol>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
