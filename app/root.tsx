import {
  isRouteErrorResponse,
  Links,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
// Supports weights 100-900
import "@fontsource-variable/dm-sans";
// Supports weights 100-900
import "@fontsource-variable/dm-sans/wght-italic.css";
// Supports weights 200-800
import "@fontsource-variable/bricolage-grotesque";
import "#app/styles/app.scss";
import { useIsSSR } from "react-aria";
import { isSSRAttrName } from "#app/utils/ssr";

export const links: Route.LinksFunction = () => [
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/images/favicon-32x32.png",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const isSSR = useIsSSR();

  return (
    <html lang="en" {...{ [isSSRAttrName]: isSSR }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Discover the weather." />
        <title>Frontend Mentor | Weather app</title>
        {/* <Meta /> */}
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
