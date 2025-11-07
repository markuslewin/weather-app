import type { PrecipitationUnit, WindSpeedUnit } from "#app/utils/settings";

const locales: Intl.LocalesArgument = "en-US";

export const formatDate = (date: Date) => {
  return Intl.DateTimeFormat(locales, {
    dateStyle: "full",
  }).format(date);
};

export const formatDay = (weekday: "short" | "long", date: Date) => {
  return Intl.DateTimeFormat(locales, { weekday }).format(date);
};

export const formatHours = (date: Date) => {
  return Intl.DateTimeFormat(locales, {
    hour: "numeric",
  }).format(date);
};

const listFormatter = new Intl.ListFormat(locales, { type: "unit" });

export const formatList = (values: unknown[]) => {
  return listFormatter.format(values.filter((val) => typeof val === "string"));
};

export const temperatureFormatter = new Intl.NumberFormat(locales, {
  style: "unit",
  unit: "degree",
  unitDisplay: "narrow",
  maximumFractionDigits: 0,
});

const getWindSpeedFormatUnit = (unit: WindSpeedUnit) => {
  switch (unit) {
    case "kmh":
      return "kilometer-per-hour";
    case "mph":
      return "mile-per-hour";
  }
};

export const createWindSpeedFormatter = (unit: WindSpeedUnit) => {
  return new Intl.NumberFormat(locales, {
    style: "unit",
    unit: getWindSpeedFormatUnit(unit),
    unitDisplay: "short",
    maximumFractionDigits: 0,
  });
};

export const percentageFormatter = new Intl.NumberFormat(locales, {
  style: "unit",
  unit: "percent",
  unitDisplay: "short",
  maximumFractionDigits: 0,
});

const getPrecipitationFormatUnit = (unit: PrecipitationUnit) => {
  switch (unit) {
    case "inch":
      return "inch";
    case "mm":
      return "millimeter";
  }
};

export const createPrecipitationFormatter = (unit: PrecipitationUnit) => {
  return new Intl.NumberFormat(locales, {
    style: "unit",
    unit: getPrecipitationFormatUnit(unit),
    unitDisplay: "short",
    maximumFractionDigits: 0,
  });
};
