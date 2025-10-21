import { default as spriteHref } from "#app/icons/sprite.svg";
import type { IconName } from "#app/icons/types";
import type { SVGProps } from "react";

export function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: IconName;
}) {
  return (
    <svg className={name} focusable="false" aria-hidden="true" {...props}>
      <use href={`${spriteHref}#${name}`} />
    </svg>
  );
}
