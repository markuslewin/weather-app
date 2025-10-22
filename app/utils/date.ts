const locale = "en-US";

export const formatDate = (date: Date) => {
  return Intl.DateTimeFormat(locale, {
    dateStyle: "full",
  }).format(date);
};

export const formatDay = (weekday: "short" | "long", date: Date) => {
  return Intl.DateTimeFormat(locale, { weekday }).format(date);
};

export const formatHours = (date: Date) => {
  return Intl.DateTimeFormat(locale, {
    hour: "numeric",
  }).format(date);
};
