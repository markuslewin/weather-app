import { useEffect, useState } from "react";

type PromiseState<T> = { type: "pending" } | { type: "fulfilled"; value: T };

export const usePromise = <T>(promise: Promise<T>) => {
  const [value, setValue] = useState<PromiseState<T>>({ type: "pending" });

  useEffect(() => {
    let isAborted = false;
    void promise.then((value) => {
      if (isAborted) return;
      setValue({ type: "fulfilled", value });
    });
    return () => {
      isAborted = true;
    };
  }, [promise]);

  return value;
};
