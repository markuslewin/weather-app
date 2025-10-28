import { Icon } from "#app/components/icon";
import { WeatherIcon } from "#app/components/weather-icon";
import {
  convertTemperature,
  convertWindSpeed,
  convertPrecipitation,
} from "#app/utils/conversion";
import {
  temperatureFormatter,
  createWindSpeedFormatter,
  createPrecipitationFormatter,
  formatDate,
  percentageFormatter,
  formatDay,
  formatHours,
} from "#app/utils/format";
import type { Settings } from "#app/utils/settings";
import { getInterpretation, getWeather } from "#app/utils/weather";
import { useState } from "react";
import {
  Select,
  Button,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
} from "react-aria-components";

export const Location = ({
  settings,
  name,
  weather,
}: {
  settings: Settings;
  name: string;
  weather: Awaited<ReturnType<typeof getWeather>>;
}) => {
  const defaultDate = weather.hourly[0]!.time.split("T")[0]!;
  const dates = [
    ...new Set(
      weather.hourly.map((hour) => {
        return hour.time.split("T")[0]!;
      })
    ),
  ];
  const [date, setDate] = useState(defaultDate);

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

  const currentWeatherInterpretation = getInterpretation(
    weather.current.weather_code
  );

  return (
    <>
      <div className="[ dashboard ] [ mt-400 desktop:600 ]">
        <div>
          <div className="current">
            <div className="card">
              <div>
                <h2 className="text-preset-4">{name}</h2>
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
                const hourPart = Number(hour.time.split("T")[1]!.slice(0, 2));
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
    </>
  );
};
