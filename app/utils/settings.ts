import * as z from "zod";

export const temperatureUnitSchema = z.literal(["celsius", "fahrenheit"]);
export const windSpeedUnitSchema = z.literal(["kmh", "mph"]);
export const precipitationUnitSchema = z.literal(["mm", "inch"]);

export type TemperatureUnit = z.infer<typeof temperatureUnitSchema>;
export type WindSpeedUnit = z.infer<typeof windSpeedUnitSchema>;
export type PrecipitationUnit = z.infer<typeof precipitationUnitSchema>;

export type Settings = {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  precipitationUnit: PrecipitationUnit;
};

export const countSystems = (settings: Settings) => {
  return Object.values(settings).reduce(
    (count, value) => {
      switch (value) {
        case "celsius":
        case "kmh":
        case "mm":
          return { ...count, metric: count.metric + 1 };
        case "fahrenheit":
        case "inch":
        case "mph":
          return { ...count, imperial: count.imperial + 1 };
      }
    },
    { metric: 0, imperial: 0 }
  );
};
