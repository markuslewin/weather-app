import type { ComponentPropsWithRef } from "react";

type CardProps = ComponentPropsWithRef<"div">;

export const Card = (props: CardProps) => {
  return <div className="card" {...props} />;
};

type CardLocationProps = ComponentPropsWithRef<"h2">;

export const CardLocation = (props: CardLocationProps) => {
  return <h2 className="text-preset-4" {...props} />;
};

type CardWeatherHeadingProps = ComponentPropsWithRef<"h3">;

export const CardWeatherHeading = (props: CardWeatherHeadingProps) => {
  return (
    <h3 className="sr-only" {...props}>
      Current weather
    </h3>
  );
};

type CardTimeProps = ComponentPropsWithRef<"p">;

export const CardTime = (props: CardTimeProps) => {
  return <p className="mt-150" {...props} />;
};

type CardWeatherProps = ComponentPropsWithRef<"div">;

export const CardWeather = (props: CardWeatherProps) => {
  return <div className="card__weather" {...props} />;
};

type CardIconPlaceholderProps = ComponentPropsWithRef<"img">;

export const CardIconPlaceholder = (props: CardIconPlaceholderProps) => {
  return (
    <img
      className="card__weather-icon"
      alt=""
      width={1}
      height={1}
      data-placeholder
      {...props}
    />
  );
};

type CardTemperatureProps = ComponentPropsWithRef<"p">;

export const CardTemperature = (props: CardTemperatureProps) => {
  return <p className="text-preset-1" {...props} />;
};
