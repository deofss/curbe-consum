import * as XLSX from "xlsx";
import { useReports } from "./useReports";
import { useTotals } from "./useTotals";
import { useCorrect } from "./useCorrect";
import { runCheckIndexMismatch } from "./runCheckIndexMismatch";

export const readExcel = async (file: any) => {
  return new Promise((res, rej) => {
    const reader = new FileReader();

    reader.onload = async (e: any) => {
      if (!e.target.result) return;
      const data = e.target.result;
      const sheetNames = XLSX.readFile(data).SheetNames;

      const reportSheet = XLSX.read(data, {
        type: "binary",
        WTF: true,
        dense: true,
        cellDates: true,
      }).Sheets[sheetNames[0]];

      // console.log(reportSheet);

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
      runCheckIndexMismatch(reports as any[], file.name);
      const totals = useTotals(parsedTotalSheet);
      const corrected = useCorrect(
        reports as any[],
        totals as any[],
        file.name
      );

      res({
        reports: reports,
        reportSheet: reportSheet,
        correctedTotals: corrected,
        rawTotals: totals,
        fileName: file.name,
      });
    };

    reader.onerror = (error) => {
      rej(error);
    };

    reader.readAsArrayBuffer(file);
  });
};
