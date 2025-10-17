import * as z from "zod";

// [WMO Weather interpretation codes (WW)](https://open-meteo.com/en/docs#weather_variable_documentation)
const definitions = [
  { codes: [0], description: "Clear sky" },
  {
    codes: [1, 2, 3],
    description: "Mainly clear, partly cloudy, and overcast",
  },
  { codes: [45, 48], description: "Fog and depositing rime fog" },
  {
    codes: [51, 53, 55],
    description: "Drizzle: Light, moderate, and dense intensity",
  },
  {
    codes: [56, 57],
    description: "Freezing Drizzle: Light and dense intensity",
  },
  {
    codes: [61, 63, 65],
    description: "Rain: Slight, moderate and heavy intensity",
  },
  { codes: [66, 67], description: "Freezing Rain: Light and heavy intensity" },
  {
    codes: [71, 73, 75],
    description: "Snow fall: Slight, moderate, and heavy intensity",
  },
  { codes: [77], description: "Snow grains" },
  {
    codes: [80, 81, 82],
    description: "Rain showers: Slight, moderate, and violent",
  },
  { codes: [85, 86], description: "Snow showers slight and heavy" },
  { codes: [95], description: "Thunderstorm: Slight or moderate" },
  { codes: [96, 99], description: "Thunderstorm with slight and heavy hail" },
];

const codes = new Set(definitions.flatMap((d) => d.codes));

const WeatherCode = z.number().refine((val) => codes.has(val));

const Weather = z.object({
  current: z.object({
    time: z.iso.datetime({ local: true }),
    temperature_2m: z.number(),
    weather_code: z.number(),
    apparent_temperature: z.number(),
    wind_speed_10m: z.number(),
    precipitation: z.number(),
    relative_humidity_2m: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.iso.datetime({ local: true })).length(24 * 7),
    temperature_2m: z.array(z.number()).length(24 * 7),
    weather_code: z.array(WeatherCode).length(24 * 7),
  }),
  daily: z.object({
    time: z.array(z.iso.date()).length(7),
    weather_code: z.array(WeatherCode).length(7),
    temperature_2m_max: z.array(z.number()).length(7),
    temperature_2m_min: z.array(z.number()).length(7),
  }),
});

export const getWeather = async () => {
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,weather_code,apparent_temperature,wind_speed_10m,precipitation,relative_humidity_2m"
  );
  const json = await response.json();
  const { hourly, daily, ...data } = Weather.parse(json);
  const weather = {
    ...data,
    hourly: Array.from({ length: 24 * 7 }, (_, i) => {
      return {
        time: hourly.time[i],
        temperature_2m: hourly.temperature_2m[i],
        weather_code: hourly.weather_code[i],
      };
    }),
    daily: Array.from({ length: 7 }, (_, i) => {
      return {
        time: daily.time[i],
        weather_code: daily.weather_code[i],
        temperature_2m_max: daily.temperature_2m_max[i],
        temperature_2m_min: daily.temperature_2m_min[i],
      };
    }),
  };
  return weather;
};
