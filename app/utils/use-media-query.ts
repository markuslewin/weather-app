import { useCallback, useSyncExternalStore } from "react";

export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = matchMedia(query);
      mql.addEventListener("change", callback);
      return () => {
        mql.removeEventListener("change", callback);
      };
    },
    [query],
  );

  const getSnapshot = () => {
    return matchMedia(query).matches;
  };

  const getServerSnapshot = () => {
    return null;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export const useIsDesktop = () => {
  // todo: Centralize token store
  return useMediaQuery("(min-width: 64em)");
};
