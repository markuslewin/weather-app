import type { Settings } from "#app/utils/settings";
import { createContext, use, type ReactNode } from "react";

const SettingsContext = createContext<Settings | null>(null);

export const useSettings = () => {
  const settings = use(SettingsContext);
  if (settings === null)
    throw new Error("`useSettings` must be used inside a `SettingsProvider`");

  return settings;
};

type SettingsProviderProps = { children?: ReactNode; value: Settings };

export const SettingsProvider = (props: SettingsProviderProps) => {
  return <SettingsContext.Provider {...props} />;
};
