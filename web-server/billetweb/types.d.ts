declare module Sponsors {

    export type Type_pack = 'PLATINIUM_XL' | 'PLATINIUM' | 'GOLD' | 'SILVER' | 'VIRTUEL' | 'AFTER' | 'SPECIAL';

    export interface Commande {
        id: string;
        extId: string;
        type_pack: Type_pack;
        options: OptionsPack[]
        lienGestionCommande: string;
        dateAchat: string;
        status: 'A_VALIDER' | 'VALIDE' | 'REFUSE' | 'ANNULE';
        paiement: {
            status: 'PAYE' | 'PARTIELLEMENT_PAYE' | 'NON_PAYE' | 'A_REMBOURSER' | 'REMBOURSE';
            datePaiement?: string;
            montantPayeTTC: number;
            montantTotalTTC: number;
        }
        acheteur: Acheteur;
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

        nom_com: string;
        mail_com: string;
        nom_compta: string;
        mail_compta: string;
    }

    export type OptionsPack = 'ANNUEL' | 'ELECTRICITE_3kW' | 'ELECTRICITE_6kW' | 'INTERNET_16Mbps'

}