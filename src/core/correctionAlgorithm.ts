import moment from "moment";
import { store } from "@/store";
import { addSingleValue } from "@/redux-features/sapToMDMSlice";

export const correctionAlgorithm = (
  fileName: string,
  valuesArray: any[],
  reportsTotal: number,
  codLC: any,
  timestampsArray: string[],
  minBillingPeriod: Date,
  maxBillingPeriod: Date
) => {
  let countRemoveFromStart = 0;
  let countRemovedFromEnd = 0;
  let newValuesArray: any[] = [];
  let possitiveValuesCount = 0;
  let foundNegativeValues = false;

  const windowSize = 1500; //varlori adiacente spike-ului pentru calcularea medianei - 100 = circa o zi
  const percentageThreshold = 200; //% fata de mediana

  const minBillingPeriodWOT = moment(minBillingPeriod, "DD.MM.YYYY")
    .add(1, "days")
    .format("DD-MMMM-YYYY");

  const maxBillingPeriodWOT = moment(maxBillingPeriod, "DD.MM.YYYY")
    .add(2, "days")
    .format("DD-MMMM-YYYY");
  const minBillingDate = new Date(minBillingPeriodWOT);
  const maxBillingDate = new Date(maxBillingPeriodWOT);

  for (let i = 0; i < valuesArray.length; i++) {
    if (valuesArray[i] < 0) {
      foundNegativeValues = true;
    }
    let dayWOTime = moment(timestampsArray[i], "DD.MM.YYYY").format(
      "DD-MMMM-YYYY"
    );
    let currentTime = moment(timestampsArray[i], "DD.MM.YYYY hh:mm").format(
      "HH:mm"
    );
    const currentDate = new Date(dayWOTime);

    if (
      i === 0 &&
      moment(currentDate)?.format("MM") !==
        moment(minBillingPeriodWOT)?.format("MM")
    ) {
      store.dispatch(
        addSingleValue([codLC, fileName, "detectat_facturat_luna_precedenta"])
      );

      return {
        foundMDMToSAP: true,
        dateDiscrepancy:
          countRemoveFromStart || countRemovedFromEnd ? true : false,
        valueCorrected: 0,
        resultsArray: valuesArray,
      };
    }

    if (Number(reportsTotal) < 0) {
      store.dispatch(
        addSingleValue([codLC, fileName, "detectat_total_raport_sap_negativ"])
      );

      return {
        foundMDMToSAP: true,
        dateDiscrepancy:
          countRemoveFromStart || countRemovedFromEnd ? true : false,
        valueCorrected: 0,
        resultsArray: valuesArray,
      };
    }
    if (currentDate >= minBillingDate && currentDate <= maxBillingDate) {
      if (currentDate.getTime() === minBillingDate.getTime()) {
        if (currentTime === "00:00") {
          countRemoveFromStart++;
          store.dispatch(
            addSingleValue([codLC, fileName, "detectat_schimb_furnizor"])
          );
        } else {
          newValuesArray = [...newValuesArray, valuesArray[i]];
          if (valuesArray[i] > 0) {
            possitiveValuesCount++;
          }
        }
      }

      if (currentDate.getTime() === maxBillingDate.getTime()) {
        if (currentTime !== "00:00") {
          countRemovedFromEnd++;
          store.dispatch(
            addSingleValue([codLC, fileName, "detectat_schimb_furnizor"])
          );
        } else {
          newValuesArray = [...newValuesArray, valuesArray[i]];
          if (valuesArray[i] > 0) {
            possitiveValuesCount++;
          }
        }
      }

      if (currentDate > minBillingDate && currentDate < maxBillingDate) {
        newValuesArray = [...newValuesArray, valuesArray[i]];
        if (valuesArray[i] > 0) {
          possitiveValuesCount++;
        }
      }
    }

    if (currentDate > maxBillingDate) {
      countRemovedFromEnd++;
    }
    if (currentDate < minBillingDate) {
      countRemoveFromStart++;
    }
  }

  if (foundNegativeValues) {
    store.dispatch(
      addSingleValue([codLC, fileName, "detectat_valori_negative"])
    );
  }

  const valueToCorrect =
    reportsTotal -
    newValuesArray.reduce((accumulator, curr) => accumulator + curr, 0);

  if (detectSpikes(newValuesArray, windowSize, percentageThreshold)) {
    store.dispatch(addSingleValue([codLC, fileName, "detectat_posibil_spike"]));
  }

  if (Number(valueToCorrect) > 0) {
    const resultsArray = positiveCorrect(
      newValuesArray.reverse(),
      valueToCorrect,
      countRemoveFromStart,
      countRemovedFromEnd,
      possitiveValuesCount,
      codLC,
      fileName
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
      countRemovedFromEnd,
      codLC,
      fileName
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
  possitiveValuesCount: number,
  codLC: any,
  fileName: string
) => {
  let arr = array.map((item) => item);
  let sumArr = arr.reduce((acc, curr) => acc + curr, 0);
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

  store.dispatch(
    addSingleValue([
      codLC,
      fileName,
      "corectat_pozitiv",
      sumArr,
      sumArr + valueToCorrect,
      valueToCorrect,
    ])
  );

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
  countRemovedFromEnd: number,
  codLC: any,
  fileName: string
) => {
  let arr = array.map((item) => item);

  let sumArr = arr.reduce((acc, curr) => acc + curr, 0);
  let remaining = -valueToCorrect;

  while (remaining > 0) {
    for (let i = 0; i < arr.length; i++) {
      if (remaining > 0 && arr[i] > 0) {
        let randomNumber = Math.floor(Math.random() * 10);

        if (randomNumber < 4) {
          arr[i] -= 1;
          remaining--;
        }
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

  store.dispatch(
    addSingleValue([
      codLC,
      fileName,
      "corectat_negativ",
      sumArr,
      sumArr + valueToCorrect,
      valueToCorrect,
    ])
  );

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

function detectSpikes(
  data: number[],
  windowSize: number,
  percentageThreshold: number
): boolean {
  const spikes: number[] = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i] >= 50) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.ceil(windowSize / 2));

      const windowData = data.slice(start, end);

      const median = calculateMedian(windowData);

      const threshold = (percentageThreshold / 100) * median;

      if (Math.abs(data[i] - median) > threshold) {
        spikes.push(i);
      }
    }
  }

  if (spikes?.length > 0) {
    return true;
  } else {
    return false;
  }
}

function calculateMedian(arr: number[]): number {
  const sortedArr = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sortedArr.length / 2);

  if (sortedArr.length % 2 === 0) {
    return (sortedArr[mid - 1] + sortedArr[mid]) / 2;
  } else {
    return sortedArr[mid];
  }
}
