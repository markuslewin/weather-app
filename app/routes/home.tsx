import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

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

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome name={loaderData.user.name} />;
}
