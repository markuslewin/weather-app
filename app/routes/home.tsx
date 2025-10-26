import { Icon } from "#app/components/icon";
import { WeatherIcon } from "#app/components/weather-icon";
import { formatDate, formatDay, formatHours } from "#app/utils/date";
import { searchResultSchema, type SearchResultItem } from "#app/utils/search";
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [settings, setSettings] = useState<{
    temperatureUnit: "celsius" | "fahrenheit";
    windSpeedUnit: "kmh" | "mph";
    precipitationUnit: "mm" | "inch";
  }>({
    temperatureUnit: "celsius",
    windSpeedUnit: "kmh",
    precipitationUnit: "mm",
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [date, setDate] = useState(weather.hourly[0]!.time.split("T")[0]);
  const list = useAsyncList<SearchResultItem>({
    load: async ({ signal, filterText = "" }) => {
      const response = await fetch(
        `/api/search?${new URLSearchParams({ name: filterText })}`,
        { signal }
      );
      const json = await response.json();
      if (signal.aborted) {
        throw new Error("Aborted during JSON parse");
      }
      return searchResultSchema.parse(json);
    },
  });

  const unit = {
    windSpeed: settings.windSpeedUnit === "kmh" ? "km/h" : "mph",
    precipitation: settings.precipitationUnit === "mm" ? "mm" : "in",
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
                <Button className="dropdown-button">Switch to Imperial</Button>
                <RadioGroup className="[ units-dialog__group ] [ stack ]">
                  <Label className="units-dialog__group-label">
                    Temperature
                  </Label>
                  <div className="[ units-dialog__radios ] [ stack ]">
                    <Radio className="dropdown-button" value="celsius">
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
                    <Radio className="dropdown-button" value="fahrenheit">
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
                <RadioGroup className="[ units-dialog__group ] [ stack ]">
                  <Label className="units-dialog__group-label">
                    Wind Speed
                  </Label>
                  <div className="[ units-dialog__radios ] [ stack ]">
                    <Radio className="dropdown-button" value="kmh">
                      km/h
                      <SelectionIndicator>
                        <Icon
                          className="dropdown-button__icon"
                          name="IconCheckmark"
                        />
                      </SelectionIndicator>
                    </Radio>
                    <Radio className="dropdown-button" value="mph">
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
                <RadioGroup className="[ units-dialog__group ] [ stack ]">
                  <Label className="units-dialog__group-label">
                    Precipitation
                  </Label>
                  <div className="[ units-dialog__radios ] [ stack ]">
                    <Radio className="dropdown-button" value="mm">
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
                    <Radio className="dropdown-button" value="inch">
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
                onInputChange={list.setFilterText}
                onSelectionChange={(key) => {
                  if (key === null) return;

                  const item = list.getItem(key);
                  if (item === undefined) return;

                  navigate(
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
                      {Math.round(weather.current.temperature_2m)}°
                    </p>
                  </div>
                </div>
                <div className="[ grid ] [ mt-250 desktop:mt-400 ]">
                  {[
                    {
                      key: "Feels Like",
                      value: `${Math.round(weather.current.apparent_temperature)}°`,
                    },
                    {
                      key: "Humidity",
                      value: `${Math.round(weather.current.relative_humidity_2m)}%`,
                    },
                    {
                      key: "Wind",
                      value: `${Math.round(weather.current.wind_speed_10m)}\u00a0${unit.windSpeed}`,
                    },
                    {
                      key: "Precipitation",
                      value: `${Math.round(weather.current.precipitation)}\u00a0${unit.precipitation}`,
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
                            {Math.round(day.temperature_2m_max)}°
                          </p>
                          <p className="text-preset-7">
                            <span className="sr-only">Min temperature: </span>
                            {Math.round(day.temperature_2m_min)}°
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
                    <ListBox
                      items={[
                        ...new Set(
                          weather.hourly.map((hour) => {
                            return hour.time.split("T")[0]!;
                          })
                        ),
                      ].map((name) => ({ name }))}
                    >
                      {(hour) => (
                        <ListBoxItem id={hour.name}>
                          {formatDay("long", new Date(hour.name))}
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
                          {Math.round(hour.temperature_2m)}°
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
