import { store } from "@/store";
import { addSingleValue } from "@/redux-features/sapToMDMSlice";

export const runCheckIndexMismatch = (data: any[], fileName: string) => {
  const consumptionPlacesArray = data?.map((item) => item?.loc_de_consum);

  const uniqueConsumptionPlaces = new Set(consumptionPlacesArray);

  for (let cunsumptionPlace of uniqueConsumptionPlaces?.values()) {
    chechIndexMismatch(data, cunsumptionPlace, fileName);
  }
  return;
};

const chechIndexMismatch = (
  data: any[],
  consumptionPlace: string,
  fileName: string
) => {
  if (!consumptionPlace) return;
  const filteredArray = data?.filter(
    (item) => item?.loc_de_consum === consumptionPlace
  );
  const eaArray = filteredArray?.filter(
    (item) => item?.cadran_registru === "EAP" || item?.cadran_registru === "EA"
  );
  const totalArray = filteredArray?.filter((item) => item?.isTotal === true);
  const total = totalArray?.reduce(
    (accum, current) => accum + current?.total_cantitate_energie_activa,
    0
  );

  // console.log(eaArray);
  let totalIndex = 0;
  for (let singleLine of eaArray) {
    const indexVechi = singleLine?.index_vechi;
    const indexNou = singleLine?.index_now;
    const pierderi = singleLine?.pierderi_dat_pd_pm;
    const corectii = singleLine?.alte_corectii;
    const constanta = singleLine?.constanta;

    const cantitate = Number(
      Number(indexNou) -
        Number(indexVechi) +
        Number(pierderi) +
        Number(corectii)
    );
    totalIndex = Number(cantitate * constanta) + Number(totalIndex);
  }

  if (Number(total - totalIndex) >= 1 || Number(total - totalIndex) <= -1) {
    store.dispatch(
      addSingleValue([
        consumptionPlace,
        fileName,
        "detectat_inconsistenta_index",
      ])
    );
  }

  return;
};
