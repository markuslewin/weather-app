import { getWeather } from "#app/utils/weather";
import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "Frontend Mentor | Weather app" },
    { name: "description", content: "Discover the weather." },
  ];
}

export async function loader() {
  const weather = await getWeather();
  return { weather };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { weather } = loaderData;
  return (
    <>
      <main>
        <pre>{JSON.stringify(weather, undefined, 2)}</pre>
      </main>
    </>
  );
}

// Units

// Switch to Imperial/Metric

// Temperature

// Celsius (°C)
// Fahrenheit (°F)

// Wind Speed

// km/h
// mph

// Precipitation

// Millimeters (mm)
// Inches (in)

// How's the sky looking today?

// Search for a city, e.g., New York
// Search

// Feels like
// <!-- Insert temperature here -->

// Humidity
// <!-- Insert humidity here -->

// Wind
// <!-- Insert wind here -->

// Precipitation
// <!-- Insert precipitation here -->

// Daily forecast
// <!-- Insert daily forecast for the next 7 days here -->

// Hourly forecast
// <!-- Insert hourly forecast for the selected day here -->
