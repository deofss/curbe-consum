import { useState } from "react";
import DirectoryInput from "./directory-input";
import { readExcel } from "./readExcel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import * as XLSX from "xlsx";
import clsx from "clsx";

const ExcelDisplay = ({}: {}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [reportData, setReportData] = useState<any>([]);
  const [totalsData, setTotalsData] = useState<any>([]);

  const handleDirectorySelect = async (filesArray: any) => {
    setIsLoading(true);
    try {
      for (const file of filesArray) {
        // const {PathParams2}: string =
        file.webkitRelativePath.split("/")[2] ?? "";
        // const pathParams1: string = file.webkitRelativePath.split("/")[1] ?? "";
        const data: any = await readExcel(file);

        if (data.reportSheet && data.correctedTotals) {
          setReportData((prevData: any) => [...prevData, ...data?.reportSheet]);
          setTotalsData((prevData: any) => [
            ...prevData,
            { data: data?.correctedTotals, fileName: data?.fileName },
          ]);
        }
      }
      setIsLoading(false);
    } catch (error) {
      // console.log(error);

      setIsLoading(false);
    }
  };

  const clearDataHandler = () => {
    setReportData([]);
    setTotalsData([]);
  };

  const handleDownload = async () => {
    const workbook = XLSX.utils.book_new();

    const reportSheet = XLSX.utils.aoa_to_sheet(reportData);

    XLSX.utils.book_append_sheet(workbook, reportSheet, "Report");
    let index = 1;
    for (let total of totalsData) {
      const totalDataFields = total.data;
      const fileName = total.fileName;

      const totalsSheetData = totalDataFields.map((item: any) =>
        item ? item.flat() : item
      );

      const maxLen = totalsSheetData.reduce(
        (max: number, { length }: { length: number }) => Math.max(max, length),
        0
      );

      const transposedMatrix = Array.from({ length: maxLen }, (_, i) =>
        totalsSheetData.map((col: any) => col[i])
      );

      const totalsSheet = XLSX.utils.aoa_to_sheet(transposedMatrix);
      XLSX.utils.book_append_sheet(
        workbook,
        totalsSheet,
        `${index}. ${fileName.substring(0, 20)}`
      );
      index++;
    }
    await XLSX.writeFile(workbook, `Report.xlsx`, {
      compression: true,
    });
  };

  return (
    <div className="w-full mt-[70px] flex flex-col items-center ">
      <Card className="w-full max-w-[1000px] mx-10 h-fit">
        <CardHeader>
          <CardTitle>Incarca dosar cu documente</CardTitle>
          <CardDescription>
            Incarcati dosarul cu documente apasand butonul de mai jos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center h-[50px] justify-end">
          <div className=" flex flex-row items-center  justify-center w-[200px]">
            {isLoading ? <LoaderCircle className="animate-spin" /> : null}
            {totalsData.length || isLoading ? null : (
              <DirectoryInput
                isLoading={isLoading}
                onDirectorySelect={handleDirectorySelect}
              />
            )}
            {!isLoading && totalsData.length ? (
              <Button
                onClick={clearDataHandler}
                className="w-full"
                variant="destructive"
              >
                Sterge dosar incarcat
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      {totalsData.length ? (
        <Card className="w-full max-w-[1000px] mx-10 mt-10 h-fit">
          <CardHeader>
            <CardTitle className="w-full flex flex-row justify-between">
              Rezultate{" "}
              {isLoading ? null : (
                <Button onClick={handleDownload}>Descarca raport</Button>
              )}
            </CardTitle>
            <CardDescription>
              Rezultatele vor fi afisate mai jos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalsData?.map((item: any, index: number) => (
              <Card key={`${index}${item.fileName}`} className="mt-4">
                <CardHeader>
                  <CardTitle>{`Extras din fisier: ${item.fileName}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table className="max-h-[250px]">
                    <TableHeader className="h-fit ">
                      <TableRow>
                        <TableHead className="text-xs">COD LC</TableHead>
                        <TableHead className="text-xs">Denumire</TableHead>
                        <TableHead className="text-xs">Gasit corr.</TableHead>
                        <TableHead className="text-xs">Val. MDM</TableHead>
                        <TableHead className="text-xs">
                          {`Val. Converge`}
                        </TableHead>

                        <TableHead className="text-xs">Diferenta</TableHead>
                        <TableHead className="text-xs">Corectat</TableHead>
                        <TableHead className="text-xs">Actual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item?.data
                        .filter((row: any, rowIndex: number) => rowIndex !== 0)
                        .map((cell: any, cellIndex: number) => {
                          if (cell[3] === cell[4]) {
                            return;
                          }

                          const actual = cell[8]?.reduce(
                            (acc: number, curr: number) => acc + curr,
                            0
                          );
                          return (
                            <TableRow key={`${cell[0]}${cellIndex}`}>
                              <TableCell className="text-xs">
                                {cell[1]}
                              </TableCell>
                              <TableCell className="text-xs">
                                {cell[0]}
                              </TableCell>
                              <TableCell className="text-xs  ">
                                <Badge
                                  className={clsx(
                                    {
                                      "bg-red-300 text-red-800 text-xs":
                                        !cell[6] && !cell[5],
                                    },
                                    {
                                      "bg-green-300 text-green-800 text-xs":
                                        cell[6] && cell[5],
                                    }
                                  )}
                                >
                                  {cell[6] ? "Da" : "Nu"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs ">
                                {`${cell[3]} kWh`}
                              </TableCell>
                              <TableCell className="text-xs">
                                {cell[6] ? `${cell[4]} kWh` : "-"}
                              </TableCell>
                              <TableCell className="text-xs">
                                {cell[6] && cell[5]
                                  ? `${cell[4] - cell[3]} kWh`
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-xs">
                                <Badge
                                  className={clsx(
                                    {
                                      "bg-red-300 text-red-800  text-xs":
                                        !cell[6] && !cell[5],
                                    },
                                    {
                                      "bg-green-300 text-green-800 text-xs":
                                        cell[6] && cell[5],
                                    }
                                  )}
                                >
                                  {cell[5] ? "Da" : "Nu"}
                                </Badge>
                              </TableCell>
                              <TableCell>{`${actual} kWh`}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ExcelDisplay;
