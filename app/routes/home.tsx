import { WeatherIcon } from "#app/components/weather-icon";
import { getInterpretation, getWeather } from "#app/utils/weather";
import { useId, useState } from "react";
import { Form, Link } from "react-router";
import type { Route } from "./+types/home";

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
          <button>Units</button>
        </div>
        {/* <div>
          <h2>Unit settings</h2>
          <button>Switch to Imperial</button>
          <fieldset>
            <legend>Temperature</legend>
            <label>
              Celsius<span aria-hidden="true"> (°C)</span>
              <input
                type="radio"
                name="temperatureUnit"
                value="celsius"
                checked={settings.temperatureUnit === "celsius"}
                onChange={() => {
                  setSettings({ ...settings, temperatureUnit: "celsius" });
                }}
              />
            </label>
            <label>
              Fahrenheit<span aria-hidden="true"> (°F)</span>
              <input
                type="radio"
                name="temperatureUnit"
                value="fahrenheit"
                checked={settings.temperatureUnit === "fahrenheit"}
                onChange={() => {
                  setSettings({ ...settings, temperatureUnit: "fahrenheit" });
                }}
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>Wind Speed</legend>
            <label>
              km/h
              <input
                type="radio"
                name="windSpeedUnit"
                value="kmh"
                checked={settings.windSpeedUnit === "kmh"}
                onChange={() => {
                  setSettings({ ...settings, windSpeedUnit: "kmh" });
                }}
              />
            </label>
            <label>
              mph
              <input
                type="radio"
                name="windSpeedUnit"
                value="mph"
                checked={settings.windSpeedUnit === "mph"}
                onChange={() => {
                  setSettings({ ...settings, windSpeedUnit: "mph" });
                }}
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>Precipitation</legend>
            <label>
              Millimeters<span aria-hidden="true"> (mm)</span>
              <input
                type="radio"
                name="precipitationUnit"
                value="mm"
                checked={settings.precipitationUnit === "mm"}
                onChange={() => {
                  setSettings({ ...settings, precipitationUnit: "mm" });
                }}
              />
            </label>
            <label>
              Inches<span aria-hidden="true"> (in)</span>
              <input
                type="radio"
                name="precipitationUnit"
                value="inch"
                checked={settings.precipitationUnit === "inch"}
                onChange={() => {
                  setSettings({ ...settings, precipitationUnit: "inch" });
                }}
              />
            </label>
          </fieldset>
        </div> */}
      </header>
      <main className="[ center ] [ mt-600 tablet:mt-800 ]">
        <div>
          <h1 className="text-preset-2 text-center">
            How’s the sky looking today?
          </h1>
          <section
            className="mt-600 tablet:mt-800"
            aria-labelledby={searchHeadingId}
          >
            <h2 className="sr-only" id={searchHeadingId}>
              Search
            </h2>
            <Form>
              <input
                className="search-input"
                name="q"
                placeholder="Search for a place..."
              />
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
                <select
                  value={date}
                  aria-label="Select date"
                  onChange={(e) => {
                    setDate(e.target.value);
                  }}
                >
                  {[
                    ...new Set(
                      weather.hourly.map((hour) => hour.time.split("T")[0])
                    ),
                  ].map((date) => {
                    return <option key={date}>{date}</option>;
                  })}
                </select>
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
