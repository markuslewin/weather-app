import z from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["production", "development"]),
  MOCKS: z.enum(["false", "true"]).transform((val) => val === "true"),
  AZURE_TENANT_ID: z.string(),
  AZURE_WEB_CLIENT_ID: z.string(),
  AZURE_WEB_CLIENT_SECRET: z.string(),
  AZURE_MAPS_CLIENT_ID: z.string(),
});

export const env = schema.parse(process.env);
