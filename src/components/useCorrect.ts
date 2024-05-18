import { correctionAlgorithm } from './correctionAlgorithm';

export const useCorrect = (reportsArray: any[], totalsArray: any[]) => {
  const resultsArray = totalsArray.map((itemRes) => {
    if (!itemRes.codLC) return;
    const valuesArray = itemRes.values;
    const totalSheetTotal = valuesArray
      .slice(0, -1)
      .reduce((acc: any, curr: any) => acc + curr, 0);

    const reportaArrayTotal = reportsArray
      .filter((item) => item.loc_de_consum === itemRes.codLC && item.isTotal)
      .reduce(
        (acc: any, curr: any) => acc + curr.total_cantitate_energie_activa,
        0
      );

    const valueToBeCorrected = reportaArrayTotal - totalSheetTotal;

    return [
      itemRes.denumireCompanie,
      itemRes.codLC,
      itemRes.codPa,
      totalSheetTotal,
      reportaArrayTotal,
      totalSheetTotal === reportaArrayTotal ? 'Correct' : 'Needed Correction',
      itemRes.um,
      totalSheetTotal === reportaArrayTotal
        ? [...itemRes.values].slice(0, -1)
        : correctionAlgorithm(
            [...itemRes.values].slice(0, -1),
            valueToBeCorrected,
            itemRes.codLC
          ),
    ];
  });
  return resultsArray;
};
