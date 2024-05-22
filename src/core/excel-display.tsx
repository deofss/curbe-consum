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
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [isDownloading, setIsDownloading] = useState(false);

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
          setReportData((prevData: any) => [
            ...prevData,
            {
              data: data?.reportSheet,
              fileName: data?.fileName,
            },
          ]);
          setTotalsData((prevData: any) => [
            ...prevData,
            {
              data: data?.correctedTotals,
              reports: data?.reportSheet,
              fileName: data?.fileName,
            },
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
    for (let total of totalsData) {
      const workbook = XLSX.utils.book_new();

      const fileName = total.fileName;

      const reportDataObject = reportData.find(
        (item: any) => item?.fileName === fileName
      )?.data;

      const reportSheet = XLSX.utils.aoa_to_sheet(reportDataObject);

      XLSX.utils.book_append_sheet(workbook, reportSheet, "Report");
      let totalDataFields: any[] = [];
      let totalData = total.data;
      for (const elements of totalData) {
        elements.splice(4, 6);
        totalDataFields = [...totalDataFields, elements];
      }
      console.log(totalDataFields);

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
      XLSX.utils.book_append_sheet(workbook, totalsSheet, `Total LC`);

      await XLSX.writeFile(workbook, `${fileName}`, {
        compression: true,
      });
    }

    window.location.reload();
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
      {totalsData?.length ? (
        <Card className=" mb-[50px]  w-full max-w-[1200px]  mb-50 mt-10 h-fit">
          <CardHeader>
            <CardTitle className="w-full flex flex-row justify-between">
              {`Rezultate: (${totalsData?.length}/${totalFileCount})`}
              {isLoading ? null : (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Descarca raporoarte</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Share link</DialogTitle>
                        <DialogDescription>
                          Verificati dosarul in care se vor descarca fisierele
                          din setarile browserului si apasate pe butonul
                          "Descarca rapoarte".
                        </DialogDescription>
                      </DialogHeader>

                      <DialogFooter className="sm:justify-end gap-4">
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            Inchide
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          onClick={async () => {
                            setIsDownloading(true);
                            await handleDownload();
                          }}
                          className="w-[170px]"
                        >
                          {isDownloading ? (
                            <LoaderCircle className="animate-spin" size={16} />
                          ) : (
                            "Descarca raporarte"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
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
                      <div>
                        <MissingComponent
                          reports={item.reports}
                          totals={item?.data}
                        />
                      </div>
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
                          <TableHead className="text-xs">
                            Gasit corres. SAP
                          </TableHead>

                          <TableHead className="text-xs">
                            {`Val. SAP`}
                          </TableHead>
                          <TableHead className="text-xs">Val. Corr</TableHead>

                          <TableHead className="text-xs">Discr. data</TableHead>
                          <TableHead className="text-xs">Corectat</TableHead>
                          <TableHead className="text-xs">Actual kWh</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item?.data
                          .filter((_: any, rowIndex: number) => rowIndex !== 0)
                          .map((cell: any, cellIndex: number) => {
                            let actual = cell[cell.length - 1];
                            return (
                              <TableRow
                                className={clsx({
                                  "hidden pointer-events-none":
                                    !showDetails[index] &&
                                    cell[8] === 0 &&
                                    cell[7],
                                })}
                                key={`${cell[1]}${cellIndex}`}
                              >
                                <TableCell className="text-xs">
                                  {cellIndex + 1}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {cell[2]}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {cell[1]}
                                </TableCell>
                                <TableCell className="text-xs  ">
                                  <Badge
                                    className={clsx(
                                      "bg-transparent pointer-events-none"
                                    )}
                                  >
                                    {cell[7] ? (
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
                                  {`${cell[5]} kWh`}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {cell[8] ? `${cell[8]} kWh` : "-"}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {cell[9] ? (
                                    <CircleCheck
                                      size={20}
                                      className="fill-red-300 stroke-1 stroke-red-800"
                                    />
                                  ) : (
                                    <CircleX
                                      size={20}
                                      className="fill-green-200 stroke-1 stroke-green-800"
                                    />
                                  )}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {cell[5] === actual && cell[8] ? (
                                    <CircleCheck
                                      size={20}
                                      className="fill-green-200 stroke-1 stroke-green-800"
                                    />
                                  ) : null}
                                  {!cell[7] && !cell[6] ? (
                                    <CircleX
                                      size={20}
                                      className="fill-red-300 stroke-1 stroke-red-800"
                                    />
                                  ) : !cell[8] ? (
                                    <>{"-"}</>
                                  ) : null}
                                </TableCell>
                                <TableCell className="w-[120px] flex flex-row items-center justify-between">
                                  <Badge
                                    className={clsx(
                                      {
                                        "bg-red-300 text-red-800 text-xs w-full pointer-events-none":
                                          actual - cell[5] !== 0,
                                      },
                                      {
                                        "bg-green-300 text-green-800 text-xs  w-full pointer-events-none":
                                          actual - cell[5] === 0,
                                      }
                                    )}
                                  >
                                    <p className="text-[10px]">{`${actual} kWh`}</p>
                                  </Badge>
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

const MissingComponent = ({
  reports,
  totals,
}: {
  reports: any;
  totals: any;
}) => {
  const lcArray = reports
    .filter((item: any[], index: number) => index !== 0)
    .map((item: any) => item[10]?.v);
  const lcSet = new Set(lcArray);
  const setArr = Array.from(lcSet);
  const totalsLC = totals?.map((item: any) => item[2]);

  let missingElementsArray: any[] = [];
  for (let setElement of setArr) {
    if (!setElement) break;
    if (!totalsLC.includes(setElement)) {
      missingElementsArray.push(setElement);
    }
  }

  if (!missingElementsArray.length) {
    return (
      <div>Din raportul MDM nu lipsesc elemente prezente in raportul SAP!</div>
    );
  }
  return (
    <div className="mt-4 ">
      In raportul MDM lipsesc urmatoarele elemente din SAP:
      <div className="grid mt-4 md:grid-cols-8  sm:grid-cols-6 xs:grid-cols-4 gap-2">
        {missingElementsArray?.map((item: string) => (
          <Badge
            variant="secondary"
            className="items-center justify-center flex pointer-events-none bg-yellow-200 text-yellow-800"
          >
            <p>{item}</p>
          </Badge>
        ))}
      </div>
      <Separator className="mt-4" />
    </div>
  );
};

export default ExcelDisplay;
