export const debounce = <Args extends unknown[], Return>(
  f: (...args: Args) => Return,
  ms: number,
) => {
  let abort: (err: Error) => void | undefined;
  return async (...args: Args): Promise<Awaited<Return>> => {
    abort?.(new Error("Function call was debounced"));
    return await new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        resolve(f(...args));
      }, ms);
      abort = (err) => {
        clearTimeout(id);
        reject(err);
      };
    });
  };
};
