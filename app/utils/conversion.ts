import type {
  PrecipitationUnit,
  TemperatureUnit,
  WindSpeedUnit,
} from "#app/utils/settings";

export const toInches = (mm: number) => {
  return mm / 25.4;
};

export const convertPrecipitation = (unit: PrecipitationUnit, mm: number) => {
  switch (unit) {
    case "inch":
      return toInches(mm);
    case "mm":
      return mm;
  }
};

export const toFahrenheit = (celsius: number) => {
  return (celsius * 9) / 5 + 32;
};

export const convertTemperature = (unit: TemperatureUnit, celsius: number) => {
  switch (unit) {
    case "celsius":
      return celsius;
    case "fahrenheit":
      return toFahrenheit(celsius);
  }
};

export const toMilesPerHour = (kmh: number) => {
  return kmh / 1.609;
};

export const convertWindSpeed = (unit: WindSpeedUnit, kmh: number) => {
  switch (unit) {
    case "kmh":
      return kmh;
    case "mph":
      return toMilesPerHour(kmh);
  }
};
