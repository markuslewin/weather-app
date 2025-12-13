import type { ComponentPropsWithRef } from "react";

type CardProps = ComponentPropsWithRef<"div">;

export const Card = (props: CardProps) => {
  return <div className="card" {...props} />;
};

type CardLocationProps = ComponentPropsWithRef<"h2">;

export const CardLocation = (props: CardLocationProps) => {
  return <h2 className="text-preset-4" {...props} />;
};

type CardTimeProps = ComponentPropsWithRef<"p">;

export const CardTime = (props: CardTimeProps) => {
  return <p className="mt-150" {...props} />;
};

type CardWeatherProps = ComponentPropsWithRef<"div">;

export const CardWeather = (props: CardWeatherProps) => {
  return <div className="card__weather" {...props} />;
};

type CardIconPlaceholderProps = ComponentPropsWithRef<"div">;

export const CardIconPlaceholder = (props: CardIconPlaceholderProps) => {
  return <div className="card__weather-icon-placeholder" {...props} />;
};

type CardTemperatureProps = ComponentPropsWithRef<"p">;

export const CardTemperature = (props: CardTemperatureProps) => {
  return <p className="text-preset-1" {...props} />;
};
