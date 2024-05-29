import { useState } from "react";
import { Button } from "@/components/ui/button";

import { LoaderCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { useAppSelector } from "@/hooks/redux-hooks";

const DownloadDetailsButton = () => {
  const stateArray = useAppSelector((state) => state.sapToMDM.array as any[]);
  const [isDownloadingDetails, setIsDownloadingDetails] = useState(false);

  const handleDownloadSAPToMDM = async () => {
    setIsDownloadingDetails(true);
    console.log(stateArray);
    try {
      const concatArray = stateArray.map(
        (item: any[]) => `${item[0]}*${item[1]}`
      );
      const set = new Set(concatArray);
      const setArr: any = Array.from(set);
      let arr: any[][] = [];
      for (let setElement of setArr) {
        let tm = setElement.split("*");
        arr.push([tm[0], tm[1]]);
      }
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.aoa_to_sheet(arr);
      XLSX.utils.book_append_sheet(workbook, sheet, `Detalii`);
      await XLSX.writeFile(workbook, `Detalii.xlsx`, {
        compression: true,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsDownloadingDetails(false);
    }
  };
  return (
    <Button onClick={async () => await handleDownloadSAPToMDM()}>
      {isDownloadingDetails ? (
        <LoaderCircle className="animate-spin" size={16} />
      ) : (
        <>Descarca raporoarte</>
      )}
    </Button>
  );
};

export default DownloadDetailsButton;
