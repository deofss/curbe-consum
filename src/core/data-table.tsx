import React, { lazy, startTransition, useEffect, useState } from "react";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";

import { useAppSelector } from "@/hooks/redux-hooks";

import clsx from "clsx";

import { Badge } from "@/components/ui/badge";
import { LoaderCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import Chart from "./chart";

import { Input } from "@/components/ui/input";

import { TableVirtuoso } from "react-virtuoso";
export const DataTable = ({ data, index }: { data: any; index: number }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [item, setItem] = useState(data?.data?.slice(1));
  const [filterValue, setFilterValue] = useState("");

  useEffect(() => {
    if (filterValue) {
      setItem(
        data?.data
          ?.slice(1)
          .filter((itm: any[]) =>
            itm[2]?.toString()?.includes(filterValue?.toString())
          )
      );
    } else {
      if (!showDetails) {
        startTransition(() =>
          setItem(
            data?.data
              ?.slice(1)
              .filter((itm: any[]) =>
                itemsWithIssues?.includes(itm[2]?.toString())
              )
          )
        );
      } else {
        startTransition(() => setItem(data?.data?.slice(1)));
      }
    }
  }, [showDetails, filterValue]);

  const [isScrolling, setIsScrolling] = useState(false);

  const stateArray = useAppSelector(
    (state: any) => state.sapToMDM.array as any[]
  );

  const concatArray = stateArray.map((item: any[]) => item.join("*"));
  const set = new Set(concatArray);
  const setArr: any = Array.from(set);
  let arr: any[][] = [];
  for (let setElement of setArr) {
    let tm = setElement.split("*");
    arr.push(tm.map((item: any) => item));
  }

  const newArrOfIssues = arr?.filter((itm) => itm[1] == data?.fileName);
  const itemsWithIssues = newArrOfIssues?.map((itm) => itm[0]);

  const getIssues = (codLC: string) => {
    let tmpArr = newArrOfIssues.map((itm) => itm);
    const filteredArrayOfIssues = tmpArr?.filter(
      (itm) => itm[0] === codLC.toString()
    );

    return filteredArrayOfIssues;
  };

  return (
    <>
      <div className="flex flex-row justify-between w-full mb-4 ">
        <Input
          placeholder="cod loc consum"
          className="my-1 mb-2 w-[300px]"
          onChange={(e) => setFilterValue(e?.target?.value)}
        />
        <div className="flex  items-center space-x-2">
          <Switch
            checked={showDetails}
            onCheckedChange={() =>
              startTransition(() => setShowDetails((prev: any) => !prev))
            }
            id={`${index}${item.fileName}`}
          />
          <Label htmlFor={`${index}${item.fileName}`}>Afiseaza tot</Label>
        </div>
      </div>
      <TableVirtuoso
        style={{ height: 450 }}
        data={item}
        className="w-full border-sm border-green-500"
        components={{
          TableRow: (props) => <TableRow {...props} />,
        }}
        context={{ isScrolling }}
        isScrolling={setIsScrolling}
        fixedHeaderContent={() => (
          <TableRow className="backdrop-blur-xl bg-secondary/80 pointer-events-none ">
            <TableHead className="text-xs text-primary  w-[70px]">
              Idx.
            </TableHead>

            <TableHead className="text-xs text-primary w-[150px]">
              COD LC
            </TableHead>
            <TableHead className="text-xs text-primary w-[150px]  ">
              Denumire
            </TableHead>

            <TableHead className="text-xs text-primary w-[300px] ">
              Grafic δ0
            </TableHead>

            <TableHead className="text-xs text-primary  w-[300px] ">
              Grafic δ1
            </TableHead>

            <TableHead className="text-xs text-primary  w-[80px]">{`Val. SAP`}</TableHead>
            <TableHead className="text-xs text-primary   w-[80px]">
              Val. Corr
            </TableHead>

            <TableHead className="text-xs text-primary  w-[120px]">
              Actual kWh
            </TableHead>
            <TableHead className="text-xs text-primary  w-[200px]">
              Anomalii
            </TableHead>
          </TableRow>
        )}
        itemContent={(cellIndex, cell) => {
          // {item?.data.map((cell: any, cellIndex: number) => {
          let actual = cell[cell.length - 1];

          let actualTotalsChartData: any;

          startTransition(
            () =>
              (actualTotalsChartData = cell[11].map((itm: any) => ({
                value: itm,
              })))
          );

          let rawTotalsChartData: any;

          startTransition(
            () =>
              (rawTotalsChartData = data?.rawData
                ?.find((dta: any) => dta?.codLC === cell[2])
                ?.values?.map((itm: any) => ({
                  value: itm,
                })))
          );

          return (
            <>
              <TableCell className="text-xs  sticky left-0 ">
                {cellIndex + 1}
              </TableCell>
              <TableCell className="text-xs sticky left-0 ">
                {cell[2]}
              </TableCell>
              <TableCell className="text-xs w-[150px]  ">{cell[1]}</TableCell>
              <React.Suspense
                fallback={<LoaderCircle className="animate-spin" size={16} />}
              >
                <TableCell className="h-full p-1 overflow-visible">
                  <React.Suspense
                    fallback={
                      <LoaderCircle className="animate-spin" size={16} />
                    }
                  >
                    {isScrolling ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <LoaderCircle className="animate-spin" size={16} />
                      </div>
                    ) : (
                      <Chart
                        chartData={rawTotalsChartData?.slice(0, -1)}
                        key={"1st"}
                      />
                    )}
                  </React.Suspense>
                </TableCell>

                <TableCell className="h-full overflow-visible p-1">
                  <React.Suspense
                    fallback={
                      <LoaderCircle className="animate-spin" size={16} />
                    }
                  >
                    {" "}
                    {isScrolling ? (
                      <div className="flex h-full w-full items-center justify-center">
                        <LoaderCircle className="animate-spin" size={16} />
                      </div>
                    ) : (
                      <Chart chartData={actualTotalsChartData} key={"second"} />
                    )}
                  </React.Suspense>
                </TableCell>
              </React.Suspense>
              {/* <TableCell className="text-xs  ">
                <Badge className={clsx("bg-transparent pointer-events-none")}>
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
              </TableCell> */}

              <TableCell className="text-xs ">{`${cell[5]} kWh`}</TableCell>
              <TableCell className="text-xs">
                {cell[8] ? `${Number(cell[8]).toFixed(3)} kWh` : "-"}
              </TableCell>
              <TableCell className="">
                <Badge
                  className={clsx(
                    {
                      "bg-red-300 text-red-800 text-xs w-full  pointer-events-none":
                        actual - cell[5] !== 0,
                    },
                    {
                      "bg-green-300 text-green-800  text-xs  w-full pointer-events-none":
                        Number(Number(actual - cell[5]).toFixed(3)) === 0,
                    }
                  )}
                >
                  {`${Number(actual).toFixed(3)} kWh`}
                </Badge>
              </TableCell>
              <TableCell className="">
                <div className=" flex flex-col gap-1 w-full">
                  {getIssues(cell[2])?.map((itm) => (
                    <Badge
                      className={clsx("pointer-events-none w-full", {
                        "bg-red-500": itm[2] === "detectat_inconsistenta_index",
                      })}
                    >
                      {itm[2]}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              {/* <TableCell className="text-xs">
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
              </TableCell> */}
              {/* <TableCell className="text-xs">
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
              </TableCell> */}
            </>
          );
        }}
      />
    </>
  );
};
