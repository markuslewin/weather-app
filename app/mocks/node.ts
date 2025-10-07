import { setupServer } from "msw/node";
import { handlers } from "~/mocks/handlers";

export const server = /* @__PURE__ */ setupServer(...handlers);
