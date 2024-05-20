import { useEffect, useState } from "react";
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
import { CircleCheck, CircleX } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

import * as XLSX from "xlsx";
import clsx from "clsx";

const ExcelDisplay = ({}: {}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalFileCount, setTotalFileCount] = useState(0);
  const [reportData, setReportData] = useState<any>([]);
  const [totalsData, setTotalsData] = useState<any>([]);
  const [showDetails, setShowDetails] = useState<any[]>([]);

  useEffect(() => {
    setShowDetails((_) =>
      Array.from({ length: totalFileCount }, (i) => (i = false))
    );
  }, [totalFileCount]);

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
      let shortFileName = fileName.split(".")[0].substring(0, 20);

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
        `${index}. ${shortFileName}`
      );
      index++;
    }
    await XLSX.writeFile(workbook, `Report.xlsx`, {
      compression: true,
    });
  };

  return (
    <div className="w-full h-full mt-[70px] ml-10 mr-10 flex flex-col items-center ">
      <Card className="w-full max-w-[1200px] mx-10 h-fit">
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
                setTotalFileCount={setTotalFileCount}
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
        <Card className=" mb-[50px]  w-full max-w-[1200px]  mb-50 mt-10 h-fit">
          <CardHeader>
            <CardTitle className="w-full flex flex-row justify-between">
              {`Rezultate: (${totalsData?.length}/${totalFileCount})`}
              {isLoading ? null : (
                <Button onClick={handleDownload}>Descarca raport</Button>
              )}
            </CardTitle>
            <CardDescription>
              {`Rezultatele vor fi afisate mai jos`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalsData?.map((item: any, index: number) => {
              return (
                <Card key={`${index}${item.fileName}`} className="mt-4">
                  <CardHeader>
                    <CardTitle>{`Extras din fisier: ${item.fileName}`}</CardTitle>
                    <CardDescription>
                      <div className="flex mt-4 items-center space-x-2">
                        <Switch
                          checked={showDetails[index]!}
                          onCheckedChange={() =>
                            setShowDetails((prev) =>
                              prev?.map((item, idx) =>
                                idx === index ? !item : item
                              )
                            )
                          }
                          id={`${index}${item.fileName}`}
                        />
                        <Label htmlFor={`${index}${item.fileName}`}>
                          Afiseaza tot
                        </Label>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table className="max-h-[250px]">
                      <TableCaption>
                        Lista actiuni. Daca este gol inseamna ca datele din
                        fisier erau corecte. Puteti vedea mai multe detalii
                        utilizand switchul de deasupra tabelului.
                      </TableCaption>
                      <TableHeader className="h-fit ">
                        <TableRow>
                          <TableHead className="text-xs">IDX</TableHead>

                          <TableHead className="text-xs">COD LC</TableHead>
                          <TableHead className="text-xs">Denumire</TableHead>
                          <TableHead className="text-xs">Gasit corr.</TableHead>
                          <TableHead className="text-xs">Val. MDM</TableHead>
                          <TableHead className="text-xs">
                            {`Val. SAP`}
                          </TableHead>

                          <TableHead className="text-xs">Diferenta</TableHead>
                          <TableHead className="text-xs">Corectat</TableHead>
                          <TableHead className="text-xs">Actual</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item?.data
                          .filter((_: any, rowIndex: number) => rowIndex !== 0)
                          .map((cell: any, cellIndex: number) => {
                            const actual = cell[8]?.reduce(
                              (acc: number, curr: number) => acc + curr,
                              0
                            );
                            return (
                              <TableRow
                                className={clsx({
                                  "hidden pointer-events-none":
                                    !showDetails[index] && cell[3] === cell[4],
                                })}
                                key={`${cell[0]}${cellIndex}`}
                              >
                                <TableCell className="text-xs">
                                  {cellIndex + 1}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {cell[1]}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {cell[0]}
                                </TableCell>
                                <TableCell className="text-xs  ">
                                  <Badge
                                    className={clsx(
                                      "bg-transparent pointer-events-none"
                                    )}
                                  >
                                    {cell[6] ? (
                                      <CircleCheck
                                        size={20}
                                        className="fill-green-200 stroke-1 stroke-green-800"
                                      />
                                    ) : (
                                      <CircleX
                                        size={20}
                                        className="fill-red-300 stroke-1 stroke-red-800"
                                      />
                                    )}
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
                                  {cell[6] && cell[5] ? (
                                    <CircleCheck
                                      size={20}
                                      className="fill-green-200 stroke-1 stroke-green-800"
                                    />
                                  ) : null}
                                  {!cell[6] && !cell[5] ? (
                                    <CircleX
                                      size={20}
                                      className="fill-red-300 stroke-1 stroke-red-800"
                                    />
                                  ) : null}
                                  {cell[3] === cell[4] ? <>{"-"}</> : null}
                                </TableCell>
                                <TableCell className="flex flex-row items-center justify-between">
                                  <Badge
                                    className={clsx(
                                      {
                                        "bg-red-300 text-red-800 text-xs w-full pointer-events-none":
                                          actual - cell[4] !== 0,
                                      },
                                      {
                                        "bg-green-300 text-green-800 text-xs  w-full pointer-events-none":
                                          actual - cell[4] === 0,
                                      }
                                    )}
                                  >{`${actual} kWh`}</Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ExcelDisplay;
