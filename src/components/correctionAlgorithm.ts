export const correctionAlgorithm = (
  valuesArray: any[],
  valueToCorrect: number,
  codLC: any
) => {
  if (Number(valueToCorrect) > 0) {
    // console.log(`${codLC}:Needs possitive correction for ${valueToCorrect}`);
    const newValuesArray = positiveCorrect(
      valuesArray.reverse(),
      valueToCorrect
    );

    return newValuesArray.reverse();
  } else if (Number(valueToCorrect) < 0) {
    // console.log(`${codLC}:Needs negative correction for ${valueToCorrect}`);
    let newValuesArray = negativeCorrect(valuesArray.reverse(), valueToCorrect);

    return newValuesArray.reverse();
  } else {
    if (codLC === "timestamps") return;
    console.log(`Something bad happened for ${codLC}`);
  }
};

const positiveCorrect = (array: number[], value: number) => {
  // console.log(array);
  let arr = array.map((item) => item);
  let remaining = value;

  while (remaining > 0) {
    for (let i = 0; i < arr.length; i++) {
      if (remaining > 0) {
        arr[i] += 1;
        remaining--;
        // console.log(
        //   `Added: 1 to ${arr[i] - 1}, remaining to be added ${remaining}`
        // );
      }
    }
  }

  console.log(arr.length);

  // console.log(`Old sum: ${array.reduce((acc, curr) => acc + curr, 0)}`);
  // console.log(`New sum: ${arr.reduce((acc, curr) => acc + curr, 0)}`);
  // console.log(
  //   `Should be:  ${array.reduce((acc, curr) => acc + curr, 0) + value}`
  // );

  return arr;
};

const negativeCorrect = (array: number[], value: number) => {
  let arr = array.map((item) => item);
  let remaining = -value;

  while (remaining > 0) {
    for (let i = 0; i < arr.length; i++) {
      if (remaining > 0 && arr[i] > 0) {
        arr[i] -= 1;
        remaining--;
        // console.log(
        //   `Subtracted: 1 from ${
        //     arr[i] + 1
        //   }, remaining to be subtracted ${remaining}`
        // );
      }
    }
  }

  console.log(arr.length);
  // console.log(`Old sum: ${array.reduce((acc, curr) => acc + curr, 0)}`);
  // console.log(`New sum: ${arr.reduce((acc, curr) => acc + curr, 0)}`);
  // console.log(
  //   `Should be:  ${array.reduce((acc, curr) => acc + curr, 0) + value}`
  // );
  return arr;
};
