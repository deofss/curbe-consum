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
import DownloadDetailsButton from "./download-details-button";

import { useAppDispatch } from "@/hooks/redux-hooks";
import { reset } from "@/redux-features/sapToMDMSlice";

import DisplayCard from "./display-card";

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

import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

const ExcelDisplay = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalFileCount, setTotalFileCount] = useState(0);
  const [reportData, setReportData] = useState<any>([]);
  const [totalsData, setTotalsData] = useState<any>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [uploadedDocumentNumber, setUploadedDocumentNumber] = useState(0);
  const { toast } = useToast();

  const dispatch = useAppDispatch();

  const handleDirectorySelect = async (filesArray: any) => {
    setIsLoading(true);
    try {
      let tmpTotalsData: any[] = [];
      let tmpReportData: any[] = [];
      for (const file of filesArray) {
        // const {PathParams2}: string =
        file.webkitRelativePath.split("/")[2] ?? "";
        // const pathParams1: string = file.webkitRelativePath.split("/")[1] ?? "";
        const data: any = await readExcel(file);

        if (data.reportSheet && data.correctedTotals) {
          tmpReportData = [
            ...tmpReportData,
            {
              data: data?.reportSheet,
              fileName: data?.fileName,
            },
          ];
          tmpTotalsData = [
            ...tmpTotalsData,
            {
              data: data?.correctedTotals,
              rawData: data?.rawTotals,
              reportsSheet: data?.reportsSheet,
              reports: data?.reports,
              fileName: data?.fileName,
            },
          ];
        }

        setUploadedDocumentNumber((prev) => prev + 1);
      }
      setReportData(tmpReportData);
      setTotalsData(tmpTotalsData);
      setIsLoading(false);
    } catch (error) {
      // console.log(error);

      setIsLoading(false);
    }
  };

  const clearDataHandler = () => {
    setReportData([]);
    setTotalsData([]);
    setUploadedDocumentNumber(0);
    dispatch(reset());
  };

  const handleDownload = async () => {
    setIsDownloading(false);
    try {
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
          // elements.splice(4, 6);
          totalDataFields = [
            ...totalDataFields,
            [...elements.slice(0, 4), ...elements.slice(10)],
          ];
          // console.log(totalDataFields);
        }

        const totalsSheetData = totalDataFields.map((item: any) =>
          item ? item?.flat() : item
        );

        const maxLen = totalsSheetData.reduce(
          (max: number, { length }: { length: number }) =>
            Math.max(max, length),
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
      toast({
        title: "Fisierele au fost descarcate!",
        description:
          "Verifica dosarul de download pentru a vizualiza fisierele descarcate.",
      });
      setIsSuccess(true);
    } catch (error) {
      setIsError(true);
    }

    setIsDownloading(false);

    // window.location.reload();
  };

  return (
    <div className="w-full h-full mt-[70px] ml-10 mr-10 flex flex-col items-center ">
      <Card className="w-full max-w-[1500px] mx-10 h-fit">
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
      {uploadedDocumentNumber > 0 ? (
        <Card className=" mb-[50px]  w-full max-w-[1500px]  mb-50 mt-10 h-fit">
          <CardHeader>
            <CardTitle className="w-full flex flex-row justify-between">
              {`Documente procesate: (${uploadedDocumentNumber}/${totalFileCount})`}
              {isLoading ? null : (
                <div className="flex flex-row gap-2">
                  <DownloadDetailsButton />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Descarca raporoarte corectate</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Descarcare rapoarte corectate</DialogTitle>
                        <DialogDescription>
                          {isError
                            ? "Fisierele nu au putut fi descarcate, va rog verificate datele fisierelor"
                            : null}
                          {isSuccess ? (
                            <>
                              <p>Fisierele au fost descarcate cu succes.</p>
                              <p>
                                Verificati dosarul de descarcare pentru a
                                vizualiza fisierele.
                              </p>
                            </>
                          ) : null}
                          {!isError && !isSuccess
                            ? ` Verificati dosarul in care se vor descarca
                              fisierele din setarile browserului si apasate pe
                              butonul "Descarca rapoarte".`
                            : null}
                        </DialogDescription>
                      </DialogHeader>

                      <DialogFooter className="sm:justify-end gap-4">
                        {!isSuccess && !isError ? (
                          <>
                            {isDownloading ? null : (
                              <DialogClose asChild>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => {
                                    setIsDownloading(false);
                                    setIsError(false);
                                    setIsSuccess(false);
                                  }}
                                >
                                  Inchide
                                </Button>
                              </DialogClose>
                            )}
                            <Button
                              type="submit"
                              onClick={async () => {
                                setIsDownloading(true);
                                await handleDownload();
                              }}
                              className="w-[170px]"
                            >
                              {isDownloading ? (
                                <LoaderCircle
                                  className="animate-spin"
                                  size={16}
                                />
                              ) : (
                                "Descarca raporarte"
                              )}
                            </Button>
                          </>
                        ) : (
                          <DialogClose asChild>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setIsLoading(false);
                                setIsError(false);
                                setIsSuccess(false);
                              }}
                            >
                              Inchide
                            </Button>
                          </DialogClose>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {`Rezultatele vor fi afisate mai jos`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalsData?.map((item: any, index: number) => {
              return (
                <DisplayCard
                  item={item}
                  key={`${index}${item.fileName}`}
                  index={index}
                />
              );
            })}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ExcelDisplay;
