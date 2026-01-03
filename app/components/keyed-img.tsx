import type { ComponentPropsWithRef } from "react";

type KeyedImgProps = Omit<ComponentPropsWithRef<"img">, "key">;

/**
 * Recreates the `img` when its `src` changes to avoid showing stale data
 */
export const KeyedImg = (props: KeyedImgProps) => {
  return <img {...props} key={props.src} />;
};
