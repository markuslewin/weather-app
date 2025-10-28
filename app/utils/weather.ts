import * as z from "zod";

export type Interpretation = {
  alt: string;
  icon: string;
};

// [WMO Weather interpretation codes (WW)](https://open-meteo.com/en/docs#weather_variable_documentation)
const interpretationByCode: Record<number, Interpretation> = {
  // Clear sky
  0: {
    alt: "Clear sky",
    icon: "icon-sunny",
  },
  // Mainly clear, partly cloudy, and overcast
  1: {
    alt: "Mainly clear",
    // icon-partly-cloudy?
    icon: "icon-sunny",
  },
  2: {
    alt: "Partly cloudy",
    icon: "icon-partly-cloudy",
  },
  3: {
    alt: "Overcast",
    icon: "icon-overcast",
  },
  // Fog and depositing rime fog
  45: {
    alt: "Fog",
    icon: "icon-fog",
  },
  48: {
    alt: "Depositing rime fog",
    icon: "icon-fog",
  },
  // Drizzle: Light, moderate, and dense intensity
  51: {
    alt: "Drizzle: Light",
    icon: "icon-drizzle",
  },
  53: {
    alt: "Drizzle: Moderate",
    icon: "icon-drizzle",
  },
  55: {
    alt: "Drizzle: Dense",
    icon: "icon-drizzle",
  },
  // Freezing Drizzle: Light and dense intensity
  56: {
    alt: "Freezing drizzle: Light",
    icon: "icon-drizzle",
  },
  57: {
    alt: "Freezing drizzle: Dense",
    icon: "icon-drizzle",
  },
  // Rain: Slight, moderate and heavy intensity
  61: {
    alt: "Rain: Slight",
    icon: "icon-rain",
  },
  63: {
    alt: "Rain: Moderate",
    icon: "icon-rain",
  },
  65: {
    alt: "Rain: Heavy intensity",
    icon: "icon-rain",
  },
  // Freezing Rain: Light and heavy intensity
  66: {
    alt: "Freezing Rain: Light",
    icon: "icon-rain",
  },
  67: {
    alt: "Freezing Rain: Heavy intensity",
    icon: "icon-rain",
  },
  // Snow fall: Slight, moderate, and heavy intensity
  71: {
    alt: "Snow fall: Slight",
    icon: "icon-snow",
  },
  73: {
    alt: "Snow fall: Moderate",
    icon: "icon-snow",
  },
  75: {
    alt: "Snow fall: Heavy intensity",
    icon: "icon-snow",
  },
  // Snow grains
  77: {
    alt: "Snow grains",
    icon: "icon-snow",
  },
  // Rain showers: Slight, moderate, and violent
  80: {
    alt: "Rain showers: Slight",
    icon: "icon-rain",
  },
  81: {
    alt: "Rain showers: Moderate",
    icon: "icon-rain",
  },
  82: {
    alt: "Rain showers: Violent",
    icon: "icon-rain",
  },
  // Snow showers slight and heavy
  85: {
    alt: "Snow showers: Slight",
    icon: "icon-snow",
  },
  86: {
    alt: "Snow showers: Heavy",
    icon: "icon-snow",
  },
  // Thunderstorm: Slight or moderate
  95: {
    alt: "Thunderstorm: Slight or moderate",
    icon: "icon-storm",
  },
  // Thunderstorm with slight and heavy hail
  96: {
    alt: "Thunderstorm with slight hail",
    icon: "icon-storm",
  },
  99: {
    alt: "Thunderstorm with heavy hail",
    icon: "icon-storm",
  },
};

export const getInterpretation = (code: number) => {
  const interpretation = interpretationByCode[code];
  if (interpretation === undefined) {
    console.warn(`Interpretation for code ${code} not found`);
  }
  return interpretation;
};

const WeatherCode = z.number().refine((val) => !!interpretationByCode[val]);

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
    `https://api.open-meteo.com/v1/forecast?${new URLSearchParams({
      latitude: "52.52",
      longitude: "13.41",
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      hourly: "temperature_2m,weather_code",
      current:
        "temperature_2m,weather_code,apparent_temperature,wind_speed_10m,precipitation,relative_humidity_2m",
    })}`
  );
  const { hourly, daily, ...data } = Weather.parse(await response.json());
  const weather = {
    ...data,
    hourly: Array.from({ length: 24 * 7 }, (_, i) => {
      return {
        time: hourly.time[i]!,
        temperature_2m: hourly.temperature_2m[i]!,
        weather_code: hourly.weather_code[i]!,
      };
    }),
    daily: Array.from({ length: 7 }, (_, i) => {
      return {
        time: daily.time[i]!,
        weather_code: daily.weather_code[i]!,
        temperature_2m_max: daily.temperature_2m_max[i]!,
        temperature_2m_min: daily.temperature_2m_min[i]!,
      };
    }),
  };
  return weather;
};
