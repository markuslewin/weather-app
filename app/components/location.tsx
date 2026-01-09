import {
  Card,
  CardIconPlaceholder,
  CardLocation,
  CardTemperature,
  CardTime,
  CardWeather,
  CardWeatherHeading,
} from "#app/components/card";
import {
  Day,
  DayHeading,
  DayIconPlaceholder,
  DayTemperature,
  DayTemperatures,
} from "#app/components/day";
import {
  Hour,
  HourIconPlaceholder,
  HourTemperature,
  HourTime,
} from "#app/components/hour";
import {
  Hourly,
  HourlyHeader,
  HourlyHeading,
  HourlyList,
  HourlySelect,
  ResolvedHourly,
} from "#app/components/hourly";
import { useSettings } from "#app/components/settings";
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
  listFormatter,
  percentageFormatter,
  temperatureFormatter,
} from "#app/utils/format";
import type { getLocation } from "#app/utils/maps";
import { isNonEmptyString } from "#app/utils/string";
import { nbsp } from "#app/utils/unicode";
import { getInterpretation, type Weather } from "#app/utils/weather";
import { Suspense } from "react";
import { Await } from "react-router";

export const Location = ({
  location,
  weather,
}: {
  location: ReturnType<typeof getLocation>;
  weather: Promise<Weather>;
}) => {
  const settings = useSettings();

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
            <Suspense
              fallback={
                <Card data-placeholder>
                  <div>
                    <CardLocation>
                      <span className="sr-only">Location: Loading</span>
                      <span aria-hidden="true">{nbsp}</span>
                    </CardLocation>
                    <CardWeatherHeading />
                    <CardTime aria-hidden="true">{nbsp}</CardTime>
                  </div>
                  <CardWeather>
                    <CardIconPlaceholder />
                    <CardTemperature aria-hidden="true">{nbsp}</CardTemperature>
                  </CardWeather>
                  <div className="loading">
                    <div className="loading__dots">
                      <div className="loading__dot" />
                      <div className="loading__dot" />
                      <div className="loading__dot" />
                    </div>
                    <p className="text-preset-6">Loading...</p>
                  </div>
                </Card>
              }
            >
              <Await resolve={weather}>
                {(weather) => {
                  const currentWeatherInterpretation = getInterpretation(
                    weather.current.weather_code,
                  );

                  return (
                    <Card>
                      <div>
                        <CardLocation>
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
                                  const props = [
                                    location?.locality,
                                    location?.country,
                                  ].filter(isNonEmptyString);
                                  if (props.length <= 0) return "Unknown";

                                  return listFormatter.format(props);
                                }}
                              </Await>
                            </Suspense>
                          </span>
                        </CardLocation>
                        <CardWeatherHeading />
                        <CardTime data-testid="time">
                          {formatDate(
                            { timeZone: weather.timezone },
                            new Date(weather.current.time),
                          )}
                        </CardTime>
                      </div>
                      <CardWeather>
                        {currentWeatherInterpretation ? (
                          <WeatherIcon
                            className="card__weather-icon"
                            interpretation={currentWeatherInterpretation}
                            data-testid="weather-code"
                          />
                        ) : (
                          <CardIconPlaceholder />
                        )}
                        <CardTemperature data-testid="temperature">
                          {temperature(weather.current.temperature_2m)}
                        </CardTemperature>
                      </CardWeather>
                    </Card>
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
                  <div
                    key={key}
                    className="[ current__prop ] [ layer-1 radius-12 ]"
                  >
                    <h4>{key}</h4>
                    <p className="mt-300 text-preset-3" data-testid={testid}>
                      <Suspense
                        fallback={
                          <span className="pulse">
                            <span className="sr-only">Loading</span>–
                          </span>
                        }
                      >
                        <Await resolve={weather}>
                          {(weather) => {
                            return getValue(weather);
                          }}
                        </Await>
                      </Suspense>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="[ daily ] [ mt-400 desktop:mt-600 ]">
            <h3 className="text-preset-5">Daily forecast</h3>
            <ol className="[ grid ] [ mt-250 ]" role="list">
              <Suspense
                fallback={Array.from({ length: 7 }).map((_, i) => {
                  return (
                    <Day key={i} className="pulse">
                      <DayHeading aria-hidden="true">{nbsp}</DayHeading>
                      <DayIconPlaceholder />
                      <DayTemperatures>
                        <DayTemperature aria-hidden="true">
                          {nbsp}
                        </DayTemperature>
                      </DayTemperatures>
                    </Day>
                  );
                })}
              >
                <Await resolve={weather}>
                  {(weather) => {
                    return weather.daily.map((day) => {
                      const interpretation = getInterpretation(
                        day.weather_code,
                      );
                      return (
                        <Day key={day.time}>
                          <DayHeading data-testid="day-name">
                            {formatDay(
                              { weekday: "short", timeZone: weather.timezone },
                              new Date(day.time),
                            )}
                          </DayHeading>
                          {interpretation ? (
                            <WeatherIcon
                              className="[ day__icon ] [ size-60 ]"
                              interpretation={interpretation}
                            />
                          ) : (
                            <DayIconPlaceholder />
                          )}
                          <DayTemperatures>
                            <DayTemperature>
                              <span className="sr-only">Max temperature: </span>
                              <span data-testid="day-temperature-max">
                                {temperature(day.temperature_2m_max)}
                              </span>
                            </DayTemperature>
                            <DayTemperature>
                              <span className="sr-only">Min temperature: </span>
                              <span data-testid="day-temperature-min">
                                {temperature(day.temperature_2m_min)}
                              </span>
                            </DayTemperature>
                          </DayTemperatures>
                        </Day>
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
                <HourlySelect className="pulse" placeholder="–" />
              </HourlyHeader>
              <HourlyList>
                {Array.from({ length: 24 }).map((_, i) => {
                  return (
                    <Hour key={i} className="pulse">
                      <HourTime aria-hidden="true">{nbsp}</HourTime>
                      <HourIconPlaceholder />
                      <HourTemperature aria-hidden="true">
                        {nbsp}
                      </HourTemperature>
                    </Hour>
                  );
                })}
              </HourlyList>
            </Hourly>
          }
        >
          <Await resolve={weather}>
            {(weather) => {
              return (
                <ResolvedHourly
                  key={`(${weather.latitude},${weather.longitude})`}
                  weather={weather}
                  temperature={temperature}
                />
              );
            }}
          </Await>
        </Suspense>
      </div>
    </>
  );
};
