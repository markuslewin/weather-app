import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "Frontend Mentor | Weather app" },
    { name: "description", content: "Discover the weather." },
  ];
}

export async function loader() {
  let user: { name: string };
  if (process.env.MOCKS === "true") {
    user = await fetch("https://api.example.com/user").then((res) =>
      res.json()
    );
  } else {
    user = { name: "Production" };
  }
  return { user };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <h1 className="text-preset-1">
        The quick brown fox jumps over the lazy dog.
      </h1>
      <p className="text-preset-2">
        The quick brown fox jumps over the lazy dog.
      </p>
      <p className="text-preset-3">
        The quick brown fox jumps over the lazy dog.
      </p>
      <div className="orange-square" />
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
