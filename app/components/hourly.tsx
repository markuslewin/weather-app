import {
  Hour,
  HourIconPlaceholder,
  HourTemperature,
  HourTime,
} from "#app/components/hour";
import { Icon } from "#app/components/icon";
import { WeatherIcon } from "#app/components/weather-icon";
import { hasValues } from "#app/utils/array";
import { formatDay, formatHours } from "#app/utils/format";
import { getInterpretation, type Weather } from "#app/utils/weather";
import { TZDate } from "@date-fns/tz";
import { isSameDay } from "date-fns";
import { useState, type ComponentPropsWithRef, type ReactNode } from "react";
import {
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";

export const Hourly = (props: ComponentPropsWithRef<"article">) => {
  return (
    <article className="[ hourly ] [ box ] [ layer-1 radius-20 ]" {...props} />
  );
};

export const HourlyHeader = (props: ComponentPropsWithRef<"header">) => {
  return <header className="cluster" {...props} />;
};

export const HourlyHeading = () => {
  return <h3 className="text-preset-5">Hourly forecast</h3>;
};

type HourlySelectProps = Omit<
  ComponentPropsWithRef<typeof Select>,
  "children"
> & { children?: ReactNode };

export const HourlySelect = ({
  className,
  children,
  ...props
}: HourlySelectProps) => {
  return (
    <Select
      className={["date-select", className].join(" ")}
      aria-label="Select date"
      {...props}
    >
      <Button>
        <SelectValue />
        <Icon name="IconDropdown" />
      </Button>
      {children}
    </Select>
  );
};

export const HourlyList = (props: ComponentPropsWithRef<"ol">) => {
  return (
    <ol className="[ hours ] [ stack ] [ mt-200 ]" role="list" {...props} />
  );
};

export const ResolvedHourly = ({
  weather,
  temperature,
}: {
  weather: Weather;
  temperature: (value: number) => string;
}) => {
  const dates = weather.daily.map((day) => day.time.getTime());
  const [date, setDate] = useState(dates[0] ?? null);

  return (
    <Hourly>
      <HourlyHeader>
        <HourlyHeading />
        {hasValues(dates) ? (
          <HourlySelect
            value={date}
            onChange={(value) => {
              setDate(
                typeof value === "number" && dates.includes(value)
                  ? value
                  : dates[0],
              );
            }}
          >
            <Popover
              className="date-select__popover"
              offset={10}
              placement="bottom end"
            >
              <ListBox items={dates.map((id) => ({ id }))}>
                {(date) => {
                  return (
                    <ListBoxItem>
                      {formatDay(
                        { weekday: "long", timeZone: weather.timezone },
                        new Date(date.id),
                      )}
                    </ListBoxItem>
                  );
                }}
              </ListBox>
            </Popover>
          </HourlySelect>
        ) : null}
      </HourlyHeader>
      <HourlyList>
        {date === null
          ? null
          : weather.hourly
              .filter((hour) => {
                const selectedDate = new TZDate(date, weather.timezone);
                return isSameDay(selectedDate, hour.time);
              })
              .map((hour) => {
                const interpretation = getInterpretation(hour.weather_code);
                return (
                  <Hour key={hour.time.getTime()}>
                    <HourTime data-testid="hour-time">
                      {formatHours({ timeZone: weather.timezone }, hour.time)}
                    </HourTime>
                    {interpretation ? (
                      <WeatherIcon
                        className="size-40"
                        interpretation={interpretation}
                      />
                    ) : (
                      <HourIconPlaceholder />
                    )}
                    <HourTemperature data-testid="hour-temperature">
                      {temperature(hour.temperature_2m)}
                    </HourTemperature>
                  </Hour>
                );
              })}
      </HourlyList>
    </Hourly>
  );
};
