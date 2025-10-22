import { WeatherIcon } from "#app/components/weather-icon";
import { getInterpretation, getWeather } from "#app/utils/weather";
import { useId, useState } from "react";
import { Form, Link } from "react-router";
import type { Route } from "./+types/home";
import { Icon } from "#app/components/icon";
import {
  Button,
  Dialog,
  DialogTrigger,
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

export function meta() {
  return [
    { title: "Frontend Mentor | Weather app" },
    { name: "description", content: "Discover the weather." },
  ];
}

export async function loader() {
  const location = "Berlin, Germany";
  const weather = await getWeather();
  return { location, weather };
}

export default function Home({
  loaderData: { location, weather },
}: Route.ComponentProps) {
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
              <div className="search-input">
                <input
                  className="search-input__input"
                  name="q"
                  placeholder="Search for a place..."
                />
                <Icon className="search-input__icon" name="IconSearch" />
              </div>
              <button className="primary-button">Search</button>
            </Form>
          </section>
          <div className="[ dashboard ] [ mt-400 desktop:600 ]">
            <div>
              <div className="current">
                <div className="[ card ] [ cluster ]">
                  <div>
                    <h2 className="text-preset-4">{location}</h2>
                    <h3 className="sr-only">Current weather</h3>
                    <p>{weather.current.time}</p>
                  </div>
                  <div>
                    {currentWeatherInterpretation ? (
                      <WeatherIcon
                        className="size-120"
                        interpretation={currentWeatherInterpretation}
                      />
                    ) : (
                      <div className="size-120" />
                    )}
                    <p className="text-preset-1">
                      {weather.current.temperature_2m}°
                    </p>
                  </div>
                </div>
                <div className="[ grid ] [ mt-250 desktop:mt-400 ]">
                  {[
                    {
                      key: "Feels Like",
                      value: `${weather.current.apparent_temperature}°`,
                    },
                    {
                      key: "Humidity",
                      value: `${weather.current.relative_humidity_2m}%`,
                    },
                    {
                      key: "Wind",
                      value: `${weather.current.wind_speed_10m} ${unit.windSpeed}`,
                    },
                    {
                      key: "Precipitation",
                      value: `${weather.current.precipitation} ${unit.precipitation}`,
                    },
                  ].map(({ key, value }) => {
                    return (
                      <div className="[ box ] [ layer-1 radius-12 ]" key={key}>
                        <h4>{key}</h4>
                        <p className="text-preset-3">{value}</p>
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
                        className="[ box ] [ layer-1 radius-12 ]"
                        key={day.time}
                      >
                        <h4>{day.time}</h4>
                        {interpretation ? (
                          <WeatherIcon
                            className="size-60"
                            interpretation={interpretation}
                          />
                        ) : (
                          <div className="size-60" />
                        )}
                        <p className="text-preset-7">
                          <span className="sr-only">Max temperature: </span>
                          {day.temperature_2m_max}°
                        </p>
                        <p className="text-preset-7">
                          <span className="sr-only">Min temperature: </span>
                          {day.temperature_2m_min}°
                        </p>
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
                            return hour.time.split("T")[0];
                          })
                        ),
                      ].map((name) => ({ name }))}
                    >
                      {(hour) => (
                        <ListBoxItem id={hour.name}>{hour.name}</ListBoxItem>
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
                        className="[ box ] [ layer-2 radius-8 ]"
                        key={hour.time}
                      >
                        <h4 className="text-preset-5--medium">{hour.time}</h4>
                        {interpretation ? (
                          <WeatherIcon
                            className="size-40"
                            interpretation={interpretation}
                          />
                        ) : (
                          <div className="size-60" />
                        )}
                        <p className="text-preset-7">{hour.temperature_2m}°</p>
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
