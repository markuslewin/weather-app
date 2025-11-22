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
  "reverse-geocoding"
);
export const meteoForecastDir = path.join(
  env.FIXTURES_DIR,
  "meteo",
  "forecast"
);
export const meteoSearchDir = path.join(env.FIXTURES_DIR, "meteo", "search");

const settingsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("json"),
    fixture: z.string(),
  }),
  z.object({
    type: z.literal("error"),
  }),
]);
export type Settings = z.infer<typeof settingsSchema>;

const getSettingsPath = (dir: string) => {
  return path.join(dir, ".settings.json");
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

export const readFixtureSettings = async (dir: string) => {
  const file = await readOptionalFile(getSettingsPath(dir));
  if (file === null) {
    return null;
  }

  return settingsSchema.parse(JSON.parse(file));
};

export const writeFixtureSettings = async (dir: string, settings: Settings) => {
  await writeFile(getSettingsPath(dir), JSON.stringify(settings));
};

export const deleteFixtureSettings = async (dir: string) => {
  await rm(getSettingsPath(dir));
};

export const readFixture = async (dir: string, name: string) => {
  const file = await readFile(path.join(dir, `${name}.json`), "utf8");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(file);
};
