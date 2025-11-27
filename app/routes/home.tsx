import { Icon } from "#app/components/icon";
import { Location } from "#app/components/location";
import { RetryButton } from "#app/components/retry-button";
import { SearchLayout } from "#app/components/search-layout";
import { getLocation } from "#app/utils/maps";
import { search } from "#app/utils/search";
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
import { createHomeUrl, homeSearchParamsSchema } from "#app/utils/url";
import { getWeather } from "#app/utils/weather";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Label,
  Popover,
  Radio,
  RadioGroup,
  SelectionIndicator,
  type ButtonProps,
} from "react-aria-components";
import { Link, redirect, type LoaderFunctionArgs } from "react-router";
import type { Route } from "./+types/home";

export async function loader({ request }: LoaderFunctionArgs) {
  const searchParamsResult = homeSearchParamsSchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );
  if (!searchParamsResult.success) {
    return { type: "initial" } as const;
  }

  const searchParams = searchParamsResult.data;
  if ("q" in searchParams) {
    const {
      items: [match],
    } = await search(searchParams.q);
    if (match === undefined) {
      return { type: "empty" } as const;
    }
    return redirect(
      createHomeUrl({
        lat: match.latitude.toString(),
        lon: match.longitude.toString(),
      })
    );
  }

  try {
    const location = getLocation({
      latitude: searchParams.lat,
      longitude: searchParams.lon,
    });
    const weather = await getWeather({
      latitude: searchParams.lat,
      longitude: searchParams.lon,
    });

    return { type: "location", data: { location, weather } } as const;
  } catch (err) {
    console.error(err);
    return { type: "error" } as const;
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [settings, setSettings] = useState<Settings>({
    temperatureUnit: "celsius",
    windSpeedUnit: "kmh",
    precipitationUnit: "mm",
  });
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
          {loaderData.type === "error" ? (
            <div className="error">
              <Icon name="IconError" width={18} height={18} />
              <h1 className="mt-300 text-preset-2">Something went wrong</h1>
              <p className="[ error__message ] [ mt-300 ]">
                We couldn’t connect to the server (API error). Please try again
                in a few moments.
              </p>
              <RetryButton />
            </div>
          ) : (
            <SearchLayout>
              {loaderData.type === "empty" ? (
                <h2 className="[ empty ] [ mt-600 ]">
                  No search result found!
                </h2>
              ) : loaderData.type === "location" ? (
                <Location
                  settings={settings}
                  location={loaderData.data.location}
                  weather={loaderData.data.weather}
                />
              ) : null}
            </SearchLayout>
          )}
        </div>
      </main>
    </>
  );
}
