import { readFile, rm, writeFile } from "fs/promises";
import path from "path";
import z from "zod";

const env = z
  .object({
    FIXTURES_DIR: z.string(),
  })
  .parse(process.env);

export const azureReverseGeocodingDir = path.join(
  env.FIXTURES_DIR,
  "azure",
  "reverse-geocoding",
);
export const meteoForecastDir = path.join(
  env.FIXTURES_DIR,
  "meteo",
  "forecast",
);
export const meteoSearchDir = path.join(env.FIXTURES_DIR, "meteo", "search");

const fixtureSchema = z.object({
  init: z.object({
    status: z.number(),
  }),
  body: z.json(),
});

export const getFixturePath = (dir: string) => {
  return path.join(dir, ".test.json");
};

export const readFixture = async (dir: string) => {
  const file = await readOptionalFile(getFixturePath(dir));
  if (file === null) {
    return null;
  }

  return fixtureSchema.parse(JSON.parse(file));
};

export const writeFixture = async (dir: string, data: unknown) => {
  await writeFile(getFixturePath(dir), JSON.stringify(data));
};

export const deleteFixture = async (dir: string) => {
  await rm(getFixturePath(dir), { force: true });
};

const readOptionalFile = async (path: string) => {
  try {
    return await readFile(path, "utf8");
  } catch (err) {
    const parsed = z
      .object({
        code: z.unknown(),
      })
      .safeParse(err);
    if (parsed.success) {
      switch (parsed.data.code) {
        case "ENOENT":
          return null;
      }
    }
    throw err;
  }
};
