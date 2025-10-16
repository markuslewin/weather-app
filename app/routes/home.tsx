import type { Route } from "./+types/home";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
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
