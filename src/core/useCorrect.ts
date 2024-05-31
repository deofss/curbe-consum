import { store } from "@/store";
import { correctionAlgorithm } from "./correctionAlgorithm";
import { addSingleValue } from "@/redux-features/sapToMDMSlice";

export const useCorrect = (
  reportsArray: any[],
  totalsArray: any[],
  fileName: string
) => {
  if (!reportsArray) return;
  if (!totalsArray) return;

  const timestampsArray = totalsArray[0].values;

  const resultsArray = totalsArray.map((itemRes, index) => {
    if (!itemRes.codLC) return;

    if (index === 0) {
      let timestampValues = itemRes.values.slice(0, -1);
      return [
        "DISTRIBUTIE OLTENIA",
        "",
        "",
        "",
        "Was:",
        "Should be:",
        "Corrected:",
        "Found corrispondent:",
        "Value corrected:",
        "Date discrepancy:",
        "Time:",
        timestampValues.flat(),
      ];
    }

    const valuesArray = itemRes.values;
    const totalSheetTotal = valuesArray
      .slice(0, -1)
      .reduce((acc: any, curr: any) => acc + curr, 0);

    const reportaArrayValues = reportsArray.filter(
      (item) => item?.loc_de_consum === itemRes?.codLC
    );

    const startingDatesArray = transform(
      reportaArrayValues.map((item) => item?.perioada_citire_de_la)
    ).map((item: any) => new Date(item));

    const endingDatesArray = transform(
      reportaArrayValues.map((item) => item?.perioada_citire_pana_la)
    ).map((item: any) => new Date(item));

    const reportsTotalArray = reportsArray
      .filter((item) => item?.loc_de_consum === itemRes?.codLC && item?.isTotal)
      .reduce(
        (acc: any, curr: any) => acc + curr?.total_cantitate_energie_activa,
        0
      );

    const minBillingPeriod = new Date(Math.min.apply(null, startingDatesArray));
    const maxBillingPeriod = new Date(Math.max.apply(null, endingDatesArray));

    // const reportArrayTotal = reportaArrayValue.filter((item) => item.isTotal === true).reduce(
    //   (acc: any, curr: any) => acc + curr?.total_cantitate_energie_activa,
    //   0
    // );

    // const valueToBeCorrected = reportsTotalArray - totalSheetTotal;

    let correctedResultsArray: any[] = [...itemRes.values].slice(0, -1);
    let foundMDMToSAP = false;
    let valueCorrected = 0;
    let dateDiscrepancy = false;

    if (
      reportsArray.find(
        (item) => item?.loc_de_consum === itemRes?.codLC && item?.isTotal
      )
    ) {
      let res = correctionAlgorithm(
        fileName,
        [...itemRes.values].slice(0, -1),
        reportsTotalArray,
        itemRes.codLC,

        timestampsArray,
        minBillingPeriod,
        maxBillingPeriod
      );

      correctedResultsArray = res?.resultsArray as [];
      foundMDMToSAP = res?.foundMDMToSAP as boolean;
      valueCorrected = res?.valueCorrected as number;
      dateDiscrepancy = res?.dateDiscrepancy as boolean;
    }

    const sum = correctedResultsArray.reduce(
      (acc: number, curr: number) => acc + curr,
      0
    );

    return [
      "",
      itemRes?.denumireCompanie,
      itemRes?.codLC,
      itemRes?.codPa,
      totalSheetTotal,
      reportsTotalArray,
      totalSheetTotal === reportsTotalArray ||
      !reportsArray.find(
        (item) => item?.loc_de_consum === itemRes?.codLC && item?.isTotal
      )
        ? false
        : true,

      foundMDMToSAP,
      valueCorrected,
      dateDiscrepancy,
      itemRes?.um,
      correctedResultsArray,
      sum,
    ];
  });

  return resultsArray;
};

function transform(arr: any[]) {
  return arr.reduce((memo: any, item: any) => {
    if (typeof item !== "undefined") {
      if (Array.isArray(item)) item = transform(item);
      // We can transform item here.
      memo.push(item);
    }
    return memo;
  }, []);
}
