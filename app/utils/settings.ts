import z from "zod";

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
