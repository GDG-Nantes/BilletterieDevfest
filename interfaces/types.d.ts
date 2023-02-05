export type TypePack = 'PLATINIUM_XL' | 'PLATINIUM' | 'GOLD' | 'SILVER' | 'VIRTUEL' | 'AFTER' | 'SPECIAL' | 'UNKNOWN';

export interface Commande {
    id: string;
    extId: string;
    typePack: TypePack;
    options: OptionsPack[]
    lienGestionCommande: string;
    dateAchat: string;
    status: 'VALIDE' //| 'A_VALIDER' | 'REFUSE' | 'ANNULE';
    paiement: {
        status: 'PAYE' | 'NON_PAYE'// | 'PARTIELLEMENT_PAYE'  | 'A_REMBOURSER' | 'REMBOURSE';
        // datePaiement?: string;
        // montantPayeTTC: number;
        montantTotalTTC: number;
    }
    acheteur: Acheteur;
    notes: string;
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

export type OptionsPack = 'ANNUEL' | 'ELECTRICITE_6kW' | 'INTERNET_16Mbps'
