import * as z from "zod";

export type Interpretation = {
  alt: string;
  icon: string;
};

// [WMO Weather interpretation codes (WW)](https://open-meteo.com/en/docs#weather_variable_documentation)
export const interpretationByCode = new Map<number, Interpretation>();
// Clear sky
interpretationByCode.set(0, {
  alt: "Clear sky",
  icon: "icon-sunny",
});
// Mainly clear, partly cloudy, and overcast
interpretationByCode.set(1, {
  alt: "Mainly clear",
  // icon-partly-cloudy?
  icon: "icon-sunny",
});
interpretationByCode.set(2, {
  alt: "Partly cloudy",
  icon: "icon-partly-cloudy",
});
interpretationByCode.set(3, {
  alt: "Overcast",
  icon: "icon-overcast",
});
// Fog and depositing rime fog
interpretationByCode.set(45, {
  alt: "Fog",
  icon: "icon-fog",
});
interpretationByCode.set(48, {
  alt: "Depositing rime fog",
  icon: "icon-fog",
});
// Drizzle: Light, moderate, and dense intensity
interpretationByCode.set(51, {
  alt: "Drizzle: Light",
  icon: "icon-drizzle",
});
interpretationByCode.set(53, {
  alt: "Drizzle: Moderate",
  icon: "icon-drizzle",
});
interpretationByCode.set(55, {
  alt: "Drizzle: Dense",
  icon: "icon-drizzle",
});
// Freezing Drizzle: Light and dense intensity
interpretationByCode.set(56, {
  alt: "Freezing drizzle: Light",
  icon: "icon-drizzle",
});
interpretationByCode.set(57, {
  alt: "Freezing drizzle: Dense",
  icon: "icon-drizzle",
});
// Rain: Slight, moderate and heavy intensity
interpretationByCode.set(61, {
  alt: "Rain: Slight",
  icon: "icon-rain",
});
interpretationByCode.set(63, {
  alt: "Rain: Moderate",
  icon: "icon-rain",
});
interpretationByCode.set(65, {
  alt: "Rain: Heavy intensity",
  icon: "icon-rain",
});
// Freezing Rain: Light and heavy intensity
interpretationByCode.set(66, {
  alt: "Freezing Rain: Light",
  icon: "icon-rain",
});
interpretationByCode.set(67, {
  alt: "Freezing Rain: Heavy intensity",
  icon: "icon-rain",
});
// Snow fall: Slight, moderate, and heavy intensity
interpretationByCode.set(71, {
  alt: "Snow fall: Slight",
  icon: "icon-snow",
});
interpretationByCode.set(73, {
  alt: "Snow fall: Moderate",
  icon: "icon-snow",
});
interpretationByCode.set(75, {
  alt: "Snow fall: Heavy intensity",
  icon: "icon-snow",
});
// Snow grains
interpretationByCode.set(77, {
  alt: "Snow grains",
  icon: "icon-snow",
});
// Rain showers: Slight, moderate, and violent
interpretationByCode.set(80, {
  alt: "Rain showers: Slight",
  icon: "icon-rain",
});
interpretationByCode.set(81, {
  alt: "Rain showers: Moderate",
  icon: "icon-rain",
});
interpretationByCode.set(82, {
  alt: "Rain showers: Violent",
  icon: "icon-rain",
});
// Snow showers slight and heavy
interpretationByCode.set(85, {
  alt: "Snow showers: Slight",
  icon: "icon-snow",
});
interpretationByCode.set(86, {
  alt: "Snow showers: Heavy",
  icon: "icon-snow",
});
// Thunderstorm: Slight or moderate
interpretationByCode.set(95, {
  alt: "Thunderstorm: Slight or moderate",
  icon: "icon-storm",
});
// Thunderstorm with slight and heavy hail
interpretationByCode.set(96, {
  alt: "Thunderstorm with slight hail",
  icon: "icon-storm",
});
interpretationByCode.set(99, {
  alt: "Thunderstorm with heavy hail",
  icon: "icon-storm",
});

export const getInterpretation = (code: number) => {
  const interpretation = interpretationByCode.get(code);
  if (interpretation === undefined) {
    console.warn(`Interpretation for code ${code} not found`);
  }
  return interpretation;
};

const WeatherCode = z.number().refine((val) => interpretationByCode.has(val));

const weatherResponseSchema = z.object({
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
    time: z.array(z.iso.datetime({ local: true })),
    temperature_2m: z.array(z.number()),
    weather_code: z.array(WeatherCode),
  }),
  daily: z.object({
    time: z.array(z.iso.date()),
    weather_code: z.array(WeatherCode),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
  }),
});
export type WeatherResponse = z.infer<typeof weatherResponseSchema>;

export const getWeather = async ({
  latitude,
  longitude,
}: {
  latitude: string;
  longitude: string;
}) => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${new URLSearchParams({
      latitude,
      longitude,
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      hourly: "temperature_2m,weather_code",
      current:
        "temperature_2m,weather_code,apparent_temperature,wind_speed_10m,precipitation,relative_humidity_2m",
    })}`,
  );
  const { hourly, daily, ...data } = weatherResponseSchema.parse(
    await response.json(),
  );
  const weather = {
    ...data,
    hourly: Array.from(hourly.time, (time, i) => {
      const temperature_2m = hourly.temperature_2m[i];
      if (temperature_2m === undefined) throw new Error("Expected number");
      const weather_code = hourly.weather_code[i];
      if (weather_code === undefined) throw new Error("Expected number");

      // new TZDate(time * 1000, data.timezone)
      // todo: Format to walltime `YYYY-MM-DDTHH:mm`

      return {
        time,
        temperature_2m,
        weather_code,
      };
    }),
    daily: Array.from(daily.time, (time, i) => {
      const weather_code = daily.weather_code[i];
      if (weather_code === undefined) throw new Error("Expected number");
      const temperature_2m_max = daily.temperature_2m_max[i];
      if (temperature_2m_max === undefined) throw new Error("Expected number");
      const temperature_2m_min = daily.temperature_2m_min[i];
      if (temperature_2m_min === undefined) throw new Error("Expected number");

      // Incorrect point in time, but correct walltime
      // https://github.com/open-meteo/open-meteo/issues/488#issuecomment-1790807777
      // new Date((time + data.utcOffsetSeconds) * 1000);
      // todo: Format to walltime `YYYY-MM-DD`

      return {
        time,
        weather_code,
        temperature_2m_max,
        temperature_2m_min,
      };
    }),
  };
  return weather;
};
export type Weather = Awaited<ReturnType<typeof getWeather>>;
