import { Icon } from "#app/components/icon";
import { SettingsProvider } from "#app/components/settings";
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
import { Link, Outlet, useNavigation } from "react-router";

export default function Layout() {
  const navigation = useNavigation();
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
          <SettingsProvider value={settings}>
            <Outlet />
          </SettingsProvider>
        </div>
      </main>
      <div className="progress-bar" role="status">
        {navigation.state !== "idle" ? (
          <>
            <div className="progress-bar__indicator" />
            <span className="sr-only">Loading</span>
          </>
        ) : null}
      </div>
    </>
  );
}
