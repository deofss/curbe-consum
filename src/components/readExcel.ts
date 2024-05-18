import * as XLSX from "xlsx";
import { useReports } from "./useReports";
import { useTotals } from "./useTotals";
import { useCorrect } from "./useCorrect";

export const readExcel = async (file: any) => {
  return new Promise((res, rej) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      if (!e.target.result) return;
      const data = e.target.result;
      const sheetNames = XLSX.readFile(data).SheetNames;
      const reportSheet = XLSX.read(data, {
        type: "binary",
        WTF: true,
        dense: true,
      }).Sheets[sheetNames[0]];

      const totalSheet = XLSX.read(data, {
        type: "binary",
        WTF: true,
        dense: true,
      }).Sheets[sheetNames[1]];

      const parsedTotalSheet = totalSheet?.map((row: any) =>
        row.map((cell: any) => cell?.v)
      );

      const parsedReportSheet = reportSheet?.map((row: any) =>
        row.map((cell: any) => cell?.v)
      );

      parsedReportSheet?.splice(0, 1);
      parsedTotalSheet?.splice(0, 1);

      const reports = useReports(parsedReportSheet);
      const totals = useTotals(parsedTotalSheet);

      const corrected = useCorrect(reports as any[], totals as any[]);
      res({ reportSheet: reportSheet, correctedTotals: corrected });
    };

    reader.onerror = (error) => {
      rej(error);
    };

    reader.readAsArrayBuffer(file);
  });
};
