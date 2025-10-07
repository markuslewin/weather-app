import { http, HttpResponse } from "msw";

export const handlers = [
  /* @__PURE__ */ http.get("https://api.example.com/user", () => {
    return HttpResponse.json({
      name: "Markus",
    });
  }),
];
