export const useReports = (inputArray: any[]) => {
  if (!inputArray) return;
  return inputArray.map((row: any) => ({
    isTotal: row[0] === "*" ? true : false,
    distribuitor: row[1],
    furnizor: row[2],
    client_final: row[3],
    cod_client: row[4],
    numar_contract_de_distributie: row[5],
    data_contract_de_distributie: row[6],
    periodicitate: row[7],
    mod_stabilire: row[8],
    POD: row[9],
    loc_de_consum: row[10],
    nivel_tensiune_punct_delimitare: row[11],
    nivel_tensiune_punct_masurare: row[12],
    perioada_factura_dec_de_la: row[13],
    perioada_factura_dec_pana_la: row[14],
    perioada_citire_de_la: row[15],
    perioada_citire_pana_la: row[16],
    serie_contor: row[17],
    cadran_registru: row[18],
    mod_det_en_react_curba_consum: row[19],
    index_vechi: row[20],
    index_now: row[21],
    diferenta_indexe: row[22],
    constanta: row[23],
    cantitate_masurata: row[24],
    cantitate_estimata: row[25],
    pierderi_dat_pd_pm: row[26],
    alte_corectii: row[27],
    motiv_alte_corectii: row[28],
    perioada_recalculare_de_la: row[29],
    perioada_recalculare_pana_la: row[30],
    total_cantitate_energie_activa: row[31],
    total_cant_fact_energie_reactive_x_tarif: row[32],
    total_cant_fact_energie_reactive_x_3_tarif: row[33],
    cos: row[34],
    unitate_masura: row[35],
    profil_specific_de_consum: row[36],
    id_curba_orara_agregata: row[37],
    cod_bp_furnizor: row[38],
    cod_consumator_final: row[39],
    instalatie: row[40],
    tip_S: row[41],
    detalii_localizare_lc: row[42],
    cantitate_factura_estimata_anterior_ea: row[43],
    den_bp_furnizor_nume_complet: row[44],
    cadran_registru_diferentiat: row[45],
    interval_citire_index_contor: row[46],
    smartMeter: row[47],
    nr_ofic_agr: row[48],
    data_inregistrare: row[49],
  }));
};
