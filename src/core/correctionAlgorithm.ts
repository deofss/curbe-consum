import moment from "moment";

export const correctionAlgorithm = (
  valuesArray: any[],
  reportsTotal: number,
  codLC: any,
  timestampsArray: string[],
  minBillingPeriod: Date,
  maxBillingPeriod: Date
) => {
  let countRemoveFromStart = 0;
  let countRemovedFromEnd = 0;
  // let datesRemovedFromEnd: any[] = [];
  // let datesRemovedFromStart: any[] = [];
  let newValuesArray: any[] = [];
  let possitiveValuesCount = 0;

  const minBillingPeriodWOT = moment(minBillingPeriod, "DD.MM.YYYY")
    .add(1, "days")
    .format("DD-MMMM-YYYY");

  const maxBillingPeriodWOT = moment(maxBillingPeriod, "DD.MM.YYYY")
    .add(1, "days")
    .format("DD-MMMM-YYYY");
  const minBillingDate = new Date(minBillingPeriodWOT);
  const maxBillingDate = new Date(maxBillingPeriodWOT);

  for (let i = 0; i < valuesArray.length; i++) {
    let dayWOTime = moment(timestampsArray[i], "DD.MM.YYYY").format(
      "DD-MMMM-YYYY"
    );
    const currentDate = new Date(dayWOTime);
    if (currentDate < minBillingDate) {
      countRemoveFromStart++;
      // datesRemovedFromStart = [...datesRemovedFromStart, currentDate];
    }
    if (currentDate >= minBillingDate && currentDate <= maxBillingDate) {
      newValuesArray = [...newValuesArray, valuesArray[i]];
      possitiveValuesCount++;
    }
    if (currentDate > maxBillingDate) {
      countRemovedFromEnd++;
      // datesRemovedFromEnd = [...datesRemovedFromEnd, currentDate];
    }
  }

  // if (countRemoveFromStart > 0 || countRemovedFromEnd > 0) {
  //   console.log(
  //     `Cod LC: ${codLC},Removed from start: ${countRemoveFromStart}, Removed from end: ${countRemovedFromEnd}, Length of values: ${
  //       newValuesArray.length
  //     }, Sum:${
  //       countRemoveFromStart + countRemovedFromEnd + newValuesArray.length
  //     }, Should be long: ${valuesArray.length}`
  //   );
  //   console.log(minBillingPeriodWOT);
  //   console.log(maxBillingPeriodWOT);
  //   // console.log(datesRemovedFromStart);
  //   // console.log(datesRemovedFromEnd);
  // }

  const valueToCorrect =
    reportsTotal -
    newValuesArray.reduce((accumulator, curr) => accumulator + curr, 0);

  if (Number(valueToCorrect) > 0) {
    const resultsArray = positiveCorrect(
      newValuesArray.reverse(),
      valueToCorrect,
      countRemoveFromStart,
      countRemovedFromEnd,
      possitiveValuesCount
    );

    return {
      foundMDMToSAP: true,
      dateDiscrepancy:
        countRemoveFromStart || countRemovedFromEnd ? true : false,
      valueCorrected: valueToCorrect,
      resultsArray: resultsArray.reverse(),
    };
  } else if (Number(valueToCorrect) < 0) {
    let resultsArray = negativeCorrect(
      newValuesArray.reverse(),
      valueToCorrect,
      countRemoveFromStart,
      countRemovedFromEnd
    );

    return {
      foundMDMToSAP: true,
      dateDiscrepancy:
        countRemoveFromStart || countRemovedFromEnd ? true : false,
      valueCorrected: valueToCorrect,
      resultsArray: resultsArray.reverse(),
    };
  } else if (Number(valueToCorrect) === 0) {
    let resultsArray = noCorrect(
      newValuesArray.reverse(),
      countRemoveFromStart,
      countRemovedFromEnd
    );

    return {
      foundMDMToSAP: true,
      dateDiscrepancy:
        countRemoveFromStart || countRemovedFromEnd ? true : false,
      valueCorrected: valueToCorrect,
      resultsArray: resultsArray.reverse(),
    };
  } else {
    if (codLC === "timestamps") return;
    console.log(`Something bad happened for ${codLC}`);
  }
};

const positiveCorrect = (
  array: number[],
  valueToCorrect: number,
  countRemoveFromStart: number,
  countRemovedFromEnd: number,
  possitiveValuesCount: number
) => {
  let arr = array.map((item) => item);
  let remaining = valueToCorrect;

  if (possitiveValuesCount < 50) {
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
  } else {
    while (remaining > 0) {
      for (let i = 0; i < arr.length; i++) {
        if (remaining > 0 && arr[i] > 0) {
          arr[i] += 1;
          remaining--;
          // console.log(
          //   `Added: 1 to ${arr[i] - 1}, remaining to be added ${remaining}`
          // );
        }
      }
    }
  }

  for (let i = 0; i < countRemoveFromStart; i++) {
    arr.push(0);
  }

  for (let j = 0; j < countRemovedFromEnd; j++) {
    arr.unshift(0);
  }

  // console.log(
  //   `SUM:${
  //     array.length + countRemoveFromStart + countRemovedFromEnd
  //   } ,Removed from start: ${countRemoveFromStart}, Removed from end: ${countRemovedFromEnd}, Array length: ${
  //     array.length
  //   }, Arr length: ${arr.length}`
  // );

  // console.log(`Old sum: ${array.reduce((acc, curr) => acc + curr, 0)}`);
  // console.log(`New sum: ${arr.reduce((acc, curr) => acc + curr, 0)}`);
  // console.log(
  //   `Should be:  ${array.reduce((acc, curr) => acc + curr, 0) + value}`
  // );

  return arr;
};

const noCorrect = (
  array: number[],
  countRemoveFromStart: number,
  countRemovedFromEnd: number
) => {
  let arr = array.map((item) => item);

  for (let i = 0; i < countRemoveFromStart; i++) {
    arr.push(0);
  }

  for (let j = 0; j < countRemovedFromEnd; j++) {
    arr.unshift(0);
  }

  // console.log(
  //   `SUM:${
  //     array.length + countRemoveFromStart + countRemovedFromEnd
  //   } ,Removed from start: ${countRemoveFromStart}, Removed from end: ${countRemovedFromEnd}, Array length: ${
  //     array.length
  //   }, Arr length: ${arr.length}`
  // );

  return arr;
};

const negativeCorrect = (
  array: number[],
  valueToCorrect: number,
  countRemoveFromStart: number,
  countRemovedFromEnd: number
) => {
  let arr = array.map((item) => item);
  let remaining = -valueToCorrect;

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

  for (let i = 0; i < countRemoveFromStart; i++) {
    arr.push(0);
  }

  for (let j = 0; j < countRemovedFromEnd; j++) {
    arr.unshift(0);
  }

  // console.log(
  //   `SUM:${
  //     array.length + countRemoveFromStart + countRemovedFromEnd
  //   } ,Removed from start: ${countRemoveFromStart}, Removed from end: ${countRemovedFromEnd}, Array length: ${
  //     array.length
  //   }, Arr length: ${arr.length}`
  // );

  // console.log(`Old sum: ${array.reduce((acc, curr) => acc + curr, 0)}`);
  // console.log(`New sum: ${arr.reduce((acc, curr) => acc + curr, 0)}`);
  // console.log(
  //   `Should be:  ${array.reduce((acc, curr) => acc + curr, 0) + value}`
  // );
  return arr;
};
