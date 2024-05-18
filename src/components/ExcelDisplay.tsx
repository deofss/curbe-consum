// import FileInput from './FileInput';
import DirectoryInput from "./DirectoryInput";
import { readExcel } from "./readExcel";

const ExcelDisplay = ({
  reportData,
  setReportData,
  totalsData,
  setTotalsData,
  setIsLoading,
}: {
  excelData: any;
  setExcelData: any;
  reportData: any;
  setReportData: any;
  totalsData: any;
  setTotalsData: any;
  setIsLoading: any;
}) => {
  const clearDataHandler = () => {};

  const handleDirectorySelect = async (filesArray: any) => {
    setIsLoading(true);
    try {
      for (const file of filesArray) {
        // const {PathParams2}: string =
        file.webkitRelativePath.split("/")[2] ?? "";
        // const pathParams1: string = file.webkitRelativePath.split("/")[1] ?? "";
        const data: any = await readExcel(file);

        if (data.reportSheet && data.correctedTotals) {
          setReportData(data?.reportSheet);
          setTotalsData(data?.correctedTotals);
        }
      }
      setIsLoading(false);
    } catch (error) {
      // console.log(error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1>Header</h1>
      <button onClick={clearDataHandler}>Clear</button>
      <DirectoryInput onDirectorySelect={handleDirectorySelect} />
    </div>
  );
};

export default ExcelDisplay;
