import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch } from "@/hooks/redux-hooks";
import { addValues } from "@/redux-features/sapToMDMSlice";
import { ScrollArea } from "@/components/ui/scroll-area";

const MissingComponent = ({ item }: { item: any }) => {
  const dispatch = useAppDispatch();

  const totalsSheetLCArray = item?.data
    ?.filter((_: any, index: number) => index !== 0)
    .map((item: any[]) => item[2]);

  const reportsSheetLCArray = item?.reports?.map(
    (item: any) => item?.loc_de_consum
  );

  let missingElementsArray: any[] = [];

  for (let lcSAPSHeet of reportsSheetLCArray) {
    if (!totalsSheetLCArray.includes(lcSAPSHeet) && lcSAPSHeet) {
      missingElementsArray = [
        ...missingElementsArray,
        [lcSAPSHeet, item.fileName],
      ];
    }
  }

  let uniqueMissingElementsArray: any[] = [];

  for (let missingElement of missingElementsArray) {
    if (!uniqueMissingElementsArray.includes(missingElement[0])) {
      uniqueMissingElementsArray = [
        ...uniqueMissingElementsArray,
        missingElement[0],
      ];
    }
  }

  if (!missingElementsArray.length) {
    return (
      <div>Din raportul MDM nu lipsesc elemente prezente in raportul SAP!</div>
    );
  }

  dispatch(addValues(missingElementsArray));

  return (
    <div className="mt-4 ">
      In raportul MDM lipsesc urmatoarele elemente din SAP:
      <ScrollArea className="h-[100px]">
        <div className="grid mt-4 md:grid-cols-8  sm:grid-cols-6 xs:grid-cols-4 gap-2">
          {uniqueMissingElementsArray?.map((item: string) => (
            <Badge
              variant="secondary"
              className="items-center justify-center flex pointer-events-none bg-yellow-200 text-yellow-800"
              key={item}
            >
              {item}
            </Badge>
          ))}
        </div>
      </ScrollArea>
      <Separator className="mt-4" />
    </div>
  );
};

export default MissingComponent;
