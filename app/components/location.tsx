import {
  Hourly,
  HourlyHeader,
  HourlyHeading,
  HourlyList,
  HourlySelect,
  ResolvedHourly,
} from "#app/components/hourly";
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
  formatList,
  percentageFormatter,
  temperatureFormatter,
} from "#app/utils/format";
import type { getLocation } from "#app/utils/maps";
import type { Settings } from "#app/utils/settings";
import {
  dailyLength,
  getInterpretation,
  hourlyLength,
  type Weather,
} from "#app/utils/weather";
import { Suspense } from "react";
import { Await } from "react-router";

export const Location = ({
  settings,
  location,
  weather,
}: {
  settings: Settings;
  location: ReturnType<typeof getLocation>;
  weather: Promise<Weather>;
}) => {
  const temperature = (value: number) => {
    return temperatureFormatter.format(
      convertTemperature(settings.temperatureUnit, value),
    );
  };

  const windSpeed = (value: number) => {
    return createWindSpeedFormatter(settings.windSpeedUnit).format(
      convertWindSpeed(settings.windSpeedUnit, value),
    );
  };

  const precipitation = (value: number) => {
    return createPrecipitationFormatter(settings.precipitationUnit).format(
      convertPrecipitation(settings.precipitationUnit, value),
    );
  };

  return (
    <>
      <div className="[ dashboard ] [ mt-400 desktop:600 ]">
        <div>
          <div className="current">
            <Suspense fallback={<div>my card fallback</div>}>
              <Await resolve={weather}>
                {(weather) => {
                  const currentWeatherInterpretation = getInterpretation(
                    weather.current.weather_code,
                  );

                  return (
                    <div className="card">
                      <div>
                        <h2 className="text-preset-4">
                          <span className="sr-only">Location: </span>
                          <span data-testid="location">
                            <Suspense
                              fallback={
                                <>
                                  <span className="sr-only">Loading</span>
                                  <span
                                    className="card__location-fallback"
                                    aria-hidden="true"
                                  >
                                    {/* A naive guess */}
                                    Berlin, Germany
                                  </span>
                                </>
                              }
                            >
                              <Await
                                resolve={location}
                                errorElement={"Unknown"}
                              >
                                {(location) => {
                                  return location === null
                                    ? "Unknown"
                                    : formatList([
                                        location.locality,
                                        location.country,
                                      ]);
                                }}
                              </Await>
                            </Suspense>
                          </span>
                        </h2>
                        <h3 className="sr-only">Current weather</h3>
                        <p className="mt-150" data-testid="time">
                          {formatDate(new Date(weather.current.time))}
                        </p>
                      </div>
                      <div className="card__weather">
                        {currentWeatherInterpretation ? (
                          <WeatherIcon
                            className="card__weather-icon"
                            interpretation={currentWeatherInterpretation}
                            data-testid="weather-code"
                          />
                        ) : null}
                        <p className="text-preset-1" data-testid="temperature">
                          {temperature(weather.current.temperature_2m)}
                        </p>
                      </div>
                    </div>
                  );
                }}
              </Await>
            </Suspense>
            <div className="[ grid ] [ mt-250 desktop:mt-400 ]">
              {[
                {
                  key: "Feels Like",
                  getValue: (weather: Weather) =>
                    temperature(weather.current.apparent_temperature),
                  testid: "feels-like",
                },
                {
                  key: "Humidity",
                  getValue: (weather: Weather) =>
                    percentageFormatter.format(
                      weather.current.relative_humidity_2m,
                    ),
                  testid: "humidity",
                },
                {
                  key: "Wind",
                  getValue: (weather: Weather) =>
                    windSpeed(weather.current.wind_speed_10m),
                  testid: "wind",
                },
                {
                  key: "Precipitation",
                  getValue: (weather: Weather) =>
                    precipitation(weather.current.precipitation),
                  testid: "precipitation",
                },
              ].map(({ key, getValue, testid }) => {
                return (
                  <Suspense key={key} fallback={<div>my card fallback</div>}>
                    <Await resolve={weather}>
                      {(weather) => {
                        return (
                          <div className="[ box ] [ layer-1 radius-12 ]">
                            <h4>{key}</h4>
                            <p
                              className="mt-300 text-preset-3"
                              data-testid={testid}
                            >
                              {getValue(weather)}
                            </p>
                          </div>
                        );
                      }}
                    </Await>
                  </Suspense>
                );
              })}
            </div>
          </div>
          <div className="[ daily ] [ mt-400 desktop:mt-600 ]">
            <h3 className="text-preset-5">Daily forecast</h3>
            <ol className="[ grid ] [ mt-250 ]" role="list">
              <Suspense
                fallback={Array.from({ length: dailyLength }).map((_, i) => {
                  return <li key={i}>my day fallback</li>;
                })}
              >
                <Await resolve={weather}>
                  {(weather) => {
                    return weather.daily.map((day) => {
                      const interpretation = getInterpretation(
                        day.weather_code,
                      );
                      return (
                        <li
                          className="[ daily__day ] [ box stack ] [ layer-1 radius-12 ]"
                          key={day.time}
                        >
                          <h4 className="text-center" data-testid="day-name">
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
                              <span data-testid="day-temperature-max">
                                {temperature(day.temperature_2m_max)}
                              </span>
                            </p>
                            <p className="text-preset-7">
                              <span className="sr-only">Min temperature: </span>
                              <span data-testid="day-temperature-min">
                                {temperature(day.temperature_2m_min)}
                              </span>
                            </p>
                          </div>
                        </li>
                      );
                    });
                  }}
                </Await>
              </Suspense>
            </ol>
          </div>
        </div>
        <Suspense
          fallback={
            <Hourly>
              <HourlyHeader>
                <HourlyHeading />
                <HourlySelect placeholder="-" />
              </HourlyHeader>
              <HourlyList>
                {Array.from({ length: hourlyLength }).map((_, i) => {
                  return <li key={i}>my hour fallback</li>;
                })}
              </HourlyList>
            </Hourly>
          }
        >
          <Await resolve={weather}>
            {(weather) => {
              return (
                <ResolvedHourly weather={weather} temperature={temperature} />
              );
            }}
          </Await>
        </Suspense>
      </div>
    </>
  );
};
