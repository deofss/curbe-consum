export const useTotals = (inputArray: any[]) => {
  const transposedArray = inputArray.map((col, i) =>
    inputArray.map((row) => row[i])
  );

  const resultsArray = transposedArray.map((row, index) => ({
    denumireCompanie: row[0],
    codLC: index === 0 ? 'timestamps' : row[1],
    codPa: row[2],
    um: row[3],
    values: row.slice(4),
  }));

  return resultsArray;
};
