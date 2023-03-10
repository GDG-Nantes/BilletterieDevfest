export type TypePack = "PLATINIUM" | "GOLD" | "SILVER" | "VIRTUEL" | "JOBBOARD" | "VELOTYPIE" | "UNKNOWN";

export interface Commande {
  id: string;
  extId: string;
  typePack: TypePack;
  options: OptionsPack[];
  lienGestionCommande: string;
  dateAchat: string;
  status: "VALIDE"; //| 'A_VALIDER' | 'REFUSE' | 'ANNULE';
  paiement: {
    status: "PAYE" | "NON_PAYE"; // | 'PARTIELLEMENT_PAYE'  | 'A_REMBOURSER' | 'REMBOURSE';
    // datePaiement?: string;
    // montantPayeTTC: number;
    montantTotalTTC: number;
  };
  acheteur: Acheteur;
  commandesLiees: Array<Commande>;
  notes: string;
  stand?: ReservedStand;
}

export interface Acheteur {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;

  entreprise: string;

  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;

  nomCom: string;
  mailCom: string;
  nomCompta: string;
  mailCompta: string;
}

export type OptionsPack =
  | "PLATINIUM_XL"
  | "AFTER"
  | "ANNUEL"
  | "ELECTRICITE_6kW"
  | "ELECTRICITE_21kW"
  | "INTERNET_16Mbps";

export interface MarquerCommandePayee {
  idCommande: string;
}

export interface Stand {
  id: string;
  reserved: boolean;
  typeMoquette: string;
}

export interface ReservedStand {
  idStand: string;
  typeMoquette: string;
  email: string;
}
