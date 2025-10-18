import { getWeather } from "#app/utils/weather";
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
  const [date, setDate] = useState(weather.hourly[0].time.split("T")[0]);

  const unit = {
    windSpeed: settings.windSpeedUnit === "kmh" ? "km/h" : "mph",
    precipitation: settings.precipitationUnit === "mm" ? "mm" : "in",
  };

  return (
    <>
      <header className="[ header ] [ center ]">
        <div className="cluster">
          <p>
            <Link to={"/"}>
              <img alt="Weather Now" src="/images/logo.svg" />
            </Link>
          </p>
          <p>
            <button>Units</button>
          </p>
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
          <h1>How's the sky looking today?</h1>
          <section
            className="mt-600 tablet:mt-800"
            aria-labelledby={searchHeadingId}
          >
            <h2 className="sr-only" id={searchHeadingId}>
              Search
            </h2>
            <Form>
              <input name="q" placeholder="Search for a place..." />
              <button>Search</button>
            </Form>
          </section>
          <div className="[ dashboard ] [ mt-400 desktop:600 ]">
            <div>
              <div className="current">
                <h2>{location}</h2>
                <h3 className="sr-only">Current weather</h3>
                <p>{weather.current.time}</p>
                <p>{weather.current.weather_code}</p>
                <p>{weather.current.temperature_2m}°</p>
                <div className="[ grid ] [ mt-250 desktop:mt-400 ]">
                  <div>
                    <h4>Feels Like</h4>
                    <p>{weather.current.apparent_temperature}°</p>
                  </div>
                  <div>
                    <h4>Humidity</h4>
                    <p>{weather.current.relative_humidity_2m}%</p>
                  </div>
                  <div>
                    <h4>Wind</h4>
                    <p>
                      {weather.current.wind_speed_10m} {unit.windSpeed}
                    </p>
                  </div>
                  <div>
                    <h4>Precipitation</h4>
                    <p>
                      {weather.current.precipitation} {unit.precipitation}
                    </p>
                  </div>
                </div>
              </div>
              <div className="[ daily ] [ mt-400 desktop:mt-600 ]">
                <h3>Daily forecast</h3>
                <ol className="[ grid ] [ mt-250 ]" role="list">
                  {weather.daily.map((day) => {
                    return (
                      <li key={day.time}>
                        <h4>{day.time}</h4>
                        <p>{day.weather_code}</p>
                        <p>
                          <span className="sr-only">Max temperature: </span>
                          {day.temperature_2m_max}°
                        </p>
                        <p>
                          <span className="sr-only">Min temperature: </span>
                          {day.temperature_2m_min}°
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
            <article className="hourly">
              <header className="cluster">
                <h3>Hourly forecast</h3>
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
              <ol className="[ stack ] [ mt-200 ]" role="list">
                {weather.hourly
                  .filter((hour) => hour.time.split("T")[0] === date)
                  .map((hour) => {
                    return (
                      <li key={hour.time}>
                        <h4>{hour.time}</h4>
                        <p>{hour.weather_code}</p>
                        <p>{hour.temperature_2m}°</p>
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
