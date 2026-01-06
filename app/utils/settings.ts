import * as cookie from "cookie";
import * as z from "zod";

export const temperatureUnitSchema = z.literal(["celsius", "fahrenheit"]);
export const windSpeedUnitSchema = z.literal(["kmh", "mph"]);
export const precipitationUnitSchema = z.literal(["mm", "inch"]);
export const settingsSchema = z.object({
  temperatureUnit: temperatureUnitSchema,
  windSpeedUnit: windSpeedUnitSchema,
  precipitationUnit: precipitationUnitSchema,
});

export type Settings = z.infer<typeof settingsSchema>;
export type TemperatureUnit = Settings["temperatureUnit"];
export type WindSpeedUnit = Settings["windSpeedUnit"];
export type PrecipitationUnit = Settings["precipitationUnit"];

export const initialSettings: Settings = {
  temperatureUnit: "celsius",
  windSpeedUnit: "kmh",
  precipitationUnit: "mm",
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

export const settingsCookieName = "settings";

export const getSettings = (request: Request) => {
  const str = request.headers.get("cookie");
  if (str === null) return initialSettings;

  const settings = cookie.parse(str)[settingsCookieName];
  if (settings === undefined) return initialSettings;

  try {
    return settingsSchema.parse(JSON.parse(settings));
  } catch {
    return initialSettings;
  }
};

export const serializeSettings = (settings: Settings) => {
  return encodeURIComponent(JSON.stringify(settings));
};
