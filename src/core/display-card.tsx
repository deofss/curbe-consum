import { useState, useEffect, PureComponent } from "react";
import { Badge } from "@/components/ui/badge";
import { CircleCheck, CircleX } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// import { Separator } from "@/components/ui/separator";
import MissingComponent from "./missing-component";

import Chart from "./chart";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "@/components/ui/table";

import clsx from "clsx";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DisplayCard = ({
  item,
  index,
}: {
  item: {
    reports: any;
    data: any;
    rawData: any;
    fileName: string;
  };
  index: number;
}) => {
  const [showDetails, setShowDetails] = useState<any[]>([]);

  useEffect(() => {
    setShowDetails((_) =>
      Array.from({ length: item?.data?.length }, (i) => (i = false))
    );
  }, []);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{`Extras din fisier: ${item.fileName}`}</CardTitle>
        <CardDescription>
          <MissingComponent item={item} />
          <div className="flex mt-4 items-center space-x-2">
            <Switch
              checked={showDetails[index]!}
              onCheckedChange={() =>
                setShowDetails((prev: any) =>
                  prev?.map((itm: any, idx: number) =>
                    idx === index ? !itm : itm
                  )
                )
              }
              id={`${index}${item.fileName}`}
            />
            <Label htmlFor={`${index}${item.fileName}`}>Afiseaza tot</Label>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="max-h-[250px]">
          <TableCaption>
            Lista actiuni. Daca este gol inseamna ca datele din fisier erau
            corecte. Puteti vedea mai multe detalii utilizand switchul de
            deasupra tabelului.
          </TableCaption>
          <TableHeader className="h-fit ">
            <TableRow>
              <TableHead className="text-xs">IDX</TableHead>
              <TableHead className="text-xs">COD LC</TableHead>
              <TableHead className="text-xs">Denumire</TableHead>

              <TableHead className="text-xs">Grafic δ0</TableHead>

              <TableHead className="text-xs">Grafic δ1</TableHead>
              <TableHead className="text-xs">Gasit corres. SAP</TableHead>

              <TableHead className="text-xs">{`Val. SAP`}</TableHead>
              <TableHead className="text-xs">Val. Corr</TableHead>

              <TableHead className="text-xs">Schimbare furn.</TableHead>
              <TableHead className="text-xs">Corectat</TableHead>
              <TableHead className="text-xs">Actual kWh</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {item?.data.map((cell: any, cellIndex: number) => {
              let timestampsArray = item?.data[0]?.[11];
              if (cellIndex === 0) return;
              let actual = cell[cell.length - 1];
              let actualTotalsChartData = cell[11].map(
                (itm: any, idx: number) => ({
                  value: itm,
                  date: timestampsArray[idx],
                })
              );

              let rawTotalsChartData = item?.rawData[cellIndex]?.values?.map(
                (itm: any, idx: number) => ({
                  value: itm,
                  date: timestampsArray[idx],
                })
              );

              return (
                <TableRow
                  className={clsx({
                    "hidden pointer-events-none":
                      !showDetails[index] && cell[8] === 0 && cell[7],
                  })}
                  key={`${cell[1]}${cellIndex}`}
                >
                  <TableCell className="text-xs">{cellIndex + 1}</TableCell>
                  <TableCell className="text-xs">{cell[2]}</TableCell>
                  <TableCell className="text-xs">{cell[1]}</TableCell>
                  <TableCell className="h-full w-full min-w-[300px] p-1">
                    <Chart
                      chartData={rawTotalsChartData.slice(0, -1)}
                      key={"1st"}
                    />
                  </TableCell>

                  <TableCell className="h-full w-full min-w-[300px] p-1">
                    <Chart chartData={actualTotalsChartData} key={"second"} />
                  </TableCell>

                  <TableCell className="text-xs  ">
                    <Badge
                      className={clsx("bg-transparent pointer-events-none")}
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
                  <TableCell className="text-xs ">{`${cell[5]} kWh`}</TableCell>
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
                      <p className="">{`${actual} kWh`}</p>
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
};

export default DisplayCard;
