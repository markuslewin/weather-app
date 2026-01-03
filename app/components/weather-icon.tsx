import { KeyedImg } from "#app/components/keyed-img";
import type { Interpretation } from "#app/utils/weather";
import type { ComponentPropsWithRef } from "react";

type WeatherIconProps = ComponentPropsWithRef<"img"> & {
  interpretation: Interpretation;
};

export const WeatherIcon = ({ interpretation, ...props }: WeatherIconProps) => {
  return (
    <KeyedImg
      alt={interpretation.alt}
      width={320}
      height={320}
      src={`/images/${interpretation.icon}.webp`}
      {...props}
    />
  );
};
