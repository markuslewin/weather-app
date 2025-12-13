import type { ComponentPropsWithRef } from "react";

type DayProps = ComponentPropsWithRef<"li">;

export const Day = ({ className, ...props }: DayProps) => {
  return (
    <li
      className={["[ box stack ] [ layer-1 radius-12 ]", className].join(" ")}
      {...props}
    />
  );
};

type DayHeadingProps = ComponentPropsWithRef<"h4">;

export const DayHeading = (props: DayHeadingProps) => {
  return <h4 className="text-center" {...props} />;
};

type DayIconPlaceholderProps = ComponentPropsWithRef<"div">;

export const DayIconPlaceholder = (props: DayIconPlaceholderProps) => {
  return <div className="size-60" {...props} />;
};

type DayTemperaturesProps = ComponentPropsWithRef<"div">;

export const DayTemperatures = (props: DayTemperaturesProps) => {
  return <div className="day__temperature" {...props} />;
};

type DayTemperatureProps = ComponentPropsWithRef<"p">;

export const DayTemperature = (props: DayTemperatureProps) => {
  return <p className="text-preset-7" {...props} />;
};
