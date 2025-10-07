import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader() {
  let user;
  if (import.meta.env.DEV) {
    user = await fetch("https://api.example.com/user").then((res) =>
      res.json()
    );
  } else {
    user = { name: "Production" };
  }
  return { user } as { user: { name: string } };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome name={loaderData.user.name} />;
}
