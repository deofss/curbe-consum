import React, { useState, useEffect, startTransition } from "react";

// import { Separator } from "@/components/ui/separator";
import MissingComponent from "./missing-component";

import { LoaderCircle } from "lucide-react";

import { DataTable } from "./data-table";

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
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{`Extras din fisier: ${item.fileName}`}</CardTitle>
        <CardDescription>
          <MissingComponent item={item} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <React.Suspense
          fallback={<LoaderCircle className="animate-spin" size={16} />}
        >
          <DataTable data={item} index={index} />
        </React.Suspense>{" "}
      </CardContent>
    </Card>
  );
};

export default DisplayCard;
