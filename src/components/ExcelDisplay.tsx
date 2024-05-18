// import FileInput from './FileInput';
import DirectoryInput from './DirectoryInput';
import { readExcel } from './readExcel';

const ExcelDisplay = ({
  excelData,
  setExcelData,
}: {
  excelData: any;
  setExcelData: any;
}) => {
  // const handleFileSelect = async (fileArray: any) => {
  //   try {
  //     for (const file of fileArray) {
  //       const data = await readExcel(file);
  //       setExcelData((prevData: any) => [...prevData, ...(data as [])]);
  //     }
  //   } catch (error) {
  //     // console.log(error);
  //   }
  // };

  const clearDataHandler = () => {
    setExcelData([]);
  };

  const handleDirectorySelect = async (filesArray: any) => {
    console.log(filesArray);
    try {
      for (const file of filesArray) {
        const inverterSerialNumber: string =
          file.webkitRelativePath.split('/')[2] ?? '';
        const responsabil: string = file.webkitRelativePath.split('/')[1] ?? '';
        const data: any = await readExcel(
          file,
          inverterSerialNumber,
          responsabil
        );
        setExcelData((prevData: any) => [...prevData, ...(data as [])]);
      }
    } catch (error) {
      // console.log(error);
    }
  };

  // useEffect(() => {
  //   // console.log(excelData);
  // }, [excelData]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h1>Inverter Data Display</h1>
      <button
        onClick={clearDataHandler}
      >{`Values stored: ${excelData.length} - Clear!`}</button>
      <DirectoryInput onDirectorySelect={handleDirectorySelect} />
      {/* <FileInput onFileSelect={handleFileSelect} /> */}
    </div>
  );
};

export default ExcelDisplay;
