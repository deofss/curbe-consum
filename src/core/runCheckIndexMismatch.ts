import { store } from "@/store";
import { addSingleValue } from "@/redux-features/sapToMDMSlice";

export const  runCheckIndexMismatch=(data:any[],fileName:string)=>{
    const consumptionPlacesArray = data?.map((item)=>item?.loc_de_consum)

    const uniqueConsumptionPlaces = new Set(consumptionPlacesArray)

    for(let cunsumptionPlace of uniqueConsumptionPlaces?.values()){
         chechIndexMismatch(data,cunsumptionPlace,fileName)
    }
    return;
}

const chechIndexMismatch= (data:any[],consumptionPlace:string,fileName:string)=>{
    if(!consumptionPlace) return;
    const filteredArray = data?.filter((item)=>item?.loc_de_consum === consumptionPlace )
    const eaArray = filteredArray?.filter((item)=>item?.cadran_registru==="EA")
    const total = filteredArray?.find((item)=>item?.isTotal === true)?.total_cantitate_energie_activa
    
    let totalIndex=0
    for(let singleLine of eaArray){
        const indexVechi = singleLine?.index_vechi;
        const indexNou = singleLine?.index_now;
        const pierderi = singleLine?.pierderi_dat_pd_pm;
        const corectii = singleLine?.alte_corectii


        const cantitate = Number(Number(indexNou) - Number(indexVechi) + Number(pierderi) + Number(corectii))
        totalIndex = cantitate + totalIndex
    }

    if(Number(total - totalIndex) > 1 ||Number(total - totalIndex)< -1){
     store.dispatch(
        addSingleValue([consumptionPlace, fileName, "detectat_inconsistenta_index"])
      );
    }

    

   return ;
}