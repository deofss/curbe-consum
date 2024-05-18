import "./App.css";
import { useState } from "react";
import * as XLSX from "xlsx";

import ExcelDisplay from "./components/ExcelDisplay";
function App() {
  const [excelData, setExcelData] = useState<any>([]);
  const [reportData, setReportData] = useState<any>([]);
  const [totalsData, setTotalsData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    const workbook = XLSX.utils.book_new();

    const totalsSheetData = totalsData.map((item: any) =>
      item ? item.flat() : item
    );

    const maxLen = totalsSheetData.reduce(
      (max: number, { length }: { length: number }) => Math.max(max, length),
      0
    );

    const transposedMatrix = Array.from({ length: maxLen }, (_, i) =>
      totalsSheetData.map((col: any) => col[i])
    );

    const reportSheet = XLSX.utils.aoa_to_sheet(reportData);
    const totalsSheet = XLSX.utils.aoa_to_sheet(transposedMatrix);

    XLSX.utils.book_append_sheet(workbook, reportSheet, "Report");
    XLSX.utils.book_append_sheet(workbook, totalsSheet, "Total LC");

    await XLSX.writeFile(workbook, "raport_pv.xlsx");
  };

  return (
    <div>
      <button disabled={isLoading} onClick={handleDownload}>
        {isLoading ? "Loading" : "Download"}
      </button>
      <ExcelDisplay
        excelData={excelData}
        reportData={reportData}
        setReportData={setReportData}
        totalsData={totalsData}
        setTotalsData={setTotalsData}
        setExcelData={setExcelData}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}

export default App;
