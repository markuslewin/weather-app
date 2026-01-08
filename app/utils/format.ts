import type { PrecipitationUnit, WindSpeedUnit } from "#app/utils/settings";
import { isNonEmptyString } from "#app/utils/string";

const locales: Intl.LocalesArgument = "en-US";

type FormatDateOptions = {
  timeZone: string;
};

export const formatDate = (options: FormatDateOptions, date: Date) => {
  return Intl.DateTimeFormat(locales, {
    dateStyle: "full",
    ...options,
  }).format(date);
};

type FormatDayOptions = {
  weekday: "short" | "long";
  timeZone: string;
};

export const formatDay = (options: FormatDayOptions, date: Date) => {
  return Intl.DateTimeFormat(locales, options).format(date);
};

type FormatHoursOptions = {
  timeZone: string;
};

export const formatHours = (options: FormatHoursOptions, date: Date) => {
  return Intl.DateTimeFormat(locales, {
    hour: "numeric",
    ...options,
  }).format(date);
};

export const listFormatter = new Intl.ListFormat(locales, { type: "unit" });

export const formatList = (values: unknown[]) => {
  return listFormatter.format(values.filter(isNonEmptyString));
};

export const temperatureFormatter = new Intl.NumberFormat(locales, {
  style: "unit",
  unit: "degree",
  unitDisplay: "narrow",
  signDisplay: "negative",
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
