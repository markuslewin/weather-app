import type { ComponentPropsWithRef } from "react";

type HourProps = ComponentPropsWithRef<"li">;

export const Hour = ({ className, ...props }: HourProps) => {
  return (
    <li
      className={["[ hours__item ] [ layer-2 radius-8 ]", className].join(" ")}
      {...props}
    ></li>
  );
};

type HourTimeProps = ComponentPropsWithRef<"h4">;

export const HourTime = (props: HourTimeProps) => {
  return <h4 className="text-preset-5--medium" {...props} />;
};

type HourIconPlaceholderProps = ComponentPropsWithRef<"div">;

export const HourIconPlaceholder = (props: HourIconPlaceholderProps) => {
  return <div className="size-40" {...props} />;
};

type HourTemperatureProps = ComponentPropsWithRef<"p">;

export const HourTemperature = (props: HourTemperatureProps) => {
  return <p className="text-preset-7" {...props} />;
};
