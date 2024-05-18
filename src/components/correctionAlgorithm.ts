export const correctionAlgorithm = (
  valuesArray: any[],
  valueToCorrect: number,
  codLC: any
) => {
  if (Number(valueToCorrect) > 0) {
    let positiveValuesCount = 0;

    valuesArray.map((item) =>
      Number(item > 0) ? positiveValuesCount++ : null
    );

    let remainingValueToBeAllocated = valueToCorrect;
    const func = (value: number) => {
      remainingValueToBeAllocated--;
      // console.log(remainingValueToBeAllocated, value, value + 1, codLC);

      return value + 1;
    };
    const newArray = valuesArray
      .reverse()
      .map((item) => (remainingValueToBeAllocated > 0 ? func(item) : item));
    return newArray.reverse();
  } else if (Number(valueToCorrect) < 0) {
    let remainingValueToBeAllocated = valueToCorrect;

    const func = (value: number) => {
      remainingValueToBeAllocated--;
      console.log(remainingValueToBeAllocated, value, value - 1, codLC);

      return value - 1;
    };
    const newArray = valuesArray
      .reverse()
      .map((item) =>
        item > 1 && remainingValueToBeAllocated > 0 ? func(item) : item
      );
    return newArray.reverse();
  } else {
    return valuesArray;
  }
};
