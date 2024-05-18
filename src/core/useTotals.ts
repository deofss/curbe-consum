export const useTotals = (inputArray: any[]) => {
  if (!inputArray) return;

  const maxLen = inputArray.reduce(
    (max: number, { length }: { length: number }) => Math.max(max, length),
    0
  );

  const transposedArray = Array.from({ length: maxLen }, (_, i) =>
    inputArray.map((col: any) => col[i])
  );
  const resultsArray = transposedArray
    .map((row, index) => ({
      denumireCompanie: row[0],
      codLC: index === 0 ? "timestamps" : row[1],
      codPa: row[2],
      um: row[3],
      values: row.slice(4),
    }))
    .filter((item) => !!item.codLC);

  return resultsArray;
};
