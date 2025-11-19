import { readFile, rm, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import z from "zod";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(dirname, "..", "fixtures");
export const meteoForecastDir = path.join(fixturesDir, "meteo", "forecast");

const resolveSettingsPath = (dir: string) => {
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

export const readFixtureSettings = async (dir: string) => {
  const file = await readOptionalFile(resolveSettingsPath(dir));
  if (file === null) {
    return null;
  }

  return settingsSchema.parse(JSON.parse(file));
};

export const writeFixtureSettings = async (dir: string, settings: unknown) => {
  await writeFile(resolveSettingsPath(dir), JSON.stringify(settings));
};

export const deleteFixtureSettings = async (dir: string) => {
  await rm(resolveSettingsPath(dir));
};

export const readFixture = async (dir: string, fixture: string) => {
  const file = await readFile(path.join(dir, `${fixture}.json`), "utf8");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(file);
};
