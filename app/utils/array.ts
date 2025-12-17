export const hasValues = <T>(array: T[]): array is [T, ...T[]] => {
  return array.length > 0;
};
