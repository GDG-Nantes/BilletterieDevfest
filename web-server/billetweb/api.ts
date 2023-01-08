import {CONFIG} from "../config";
import axios from "axios";
import {Commande, OptionsPack, TypePack} from "./types";
import {Attendee} from "./types-billetweb";

const axiosClientBilletWeb = axios.create({
    baseURL: `https://billetweb.fr/api/event/${CONFIG.billetweb.event}/`,
    params: {
        user: CONFIG.billetweb.user,
        key: CONFIG.billetweb.apiKey,
        version: 1
    }
})

export const BilletWebApi = {

    getSponsors: async function (): Promise<Commande[]> {
        let attendees: Attendee[] = (await axiosClientBilletWeb.get<Attendee[]>('attendees')).data;

        const commandes: { [id: string]: Commande } = {}
        attendees
            .filter(attendee => calculerTypeTicket(attendee.ticket) === 'PARTENAIRE')
            .forEach(attendee => {
                if (commandes[attendee.order_id] == null) {
                    commandes[attendee.order_id] = initialiserCommande(attendee);
                }
            })

        attendees.forEach(attendee => {
            const typeTicket = calculerTypeTicket(attendee.ticket)
            let commande: Commande | null = commandes[attendee.order_id]
            if(commande == null && attendee.category !== 'Choix du stand'){
                commande = Object.values(commandes)
                    .find(commande => commande.acheteur.entreprise === attendee.custom_order.Entreprise) as Commande | null

                if (commande != null) {
                    commande.paiement.montantTotalTTC += parseInt(attendee.price)
                    commande.notes += `Liée à la commande ${attendee.order_ext_id}
                    `
                }
            }
            if (commande != null) {
                switch (typeTicket) {
                    case 'PLATINIUM':
                    case 'VIRTUEL':
                    case 'GOLD':
                    case 'SILVER':
                    case 'SPECIAL':
                        if (commande.typePack === 'UNKNOWN') {
                            commande.typePack = typeTicket
                        }
                        break
                    case 'ANNUEL':
                    case 'INTERNET_16Mbps':
                    case 'ELECTRICITE_6kW':
                        commande.options.push(typeTicket)
                        break
                    case 'PLATINIUM_XL':
                    case 'AFTER':
                        commande.typePack = typeTicket
                        break
                }
            } else if (attendee.category !== 'Choix du stand') {
                console.error("Erreur de l'analyse de la commande", attendee)
            }
        })

        return Object.values(commandes)
    }

}

function calculerTypeTicket(ticket: string): OptionsPack | TypePack | "PARTENAIRE" {
    const regexpTypeTicket: { [r: string]: OptionsPack | TypePack | 'PARTENAIRE' } = {
        "Pack Platinium - 18m2": "PLATINIUM",
        "Pack Gold - 12m2": "GOLD",
        "Pack Silver - 9m2": "SILVER",
        "Pack Virtuel - Pas de stand": "VIRTUEL",
        "Pack Special - 12m2": "SPECIAL",

        "AfterParty": "AFTER",
        "Option PXL": "PLATINIUM_XL",
        "Electricité : 6KW à la place de 3KW": "ELECTRICITE_6kW",
        "Partenaire annuel GDG Nantes": "ANNUEL",
        "Internet : Connexion filaire 16Mbps": "INTERNET_16Mbps",

        "Partenaire Devfest": "PARTENAIRE"
    }
    return selectValueByRegexp(ticket, regexpTypeTicket) || 'UNKNOWN'
}

function selectValueByRegexp<T>(label: string, regexpValues: { [r: string]: T }): T | null {
    const entryTypePack: [string, T] | undefined = Object.entries(regexpValues)
        .filter(([r]) => new RegExp(r, 'i').test(label))[0];
    if (entryTypePack != null) {
        return entryTypePack[1]
    }
    return null
}

function initialiserCommande(commandeSponsor: Attendee): Commande {
    return {
        id: commandeSponsor.order_id,
        extId: commandeSponsor.order_ext_id,
        dateAchat: commandeSponsor.order_date,
        status: 'VALIDE',
        lienGestionCommande: commandeSponsor.order_management,
        typePack: 'UNKNOWN',
        acheteur: {
            email: commandeSponsor.email,
            nom: commandeSponsor.order_name,
            prenom: commandeSponsor.order_firstname,

            entreprise: commandeSponsor.custom_order.Entreprise,
            adresse: commandeSponsor.custom_order.Adresse,
            code_postal: commandeSponsor.custom_order["Code postal"],
            ville: commandeSponsor.custom_order.Ville,
            telephone: commandeSponsor.custom_order.Téléphone,
            pays: commandeSponsor.custom_order.Pays,

            nomCom: commandeSponsor.custom_order["Nom du responsable communication"],
            mailCom: commandeSponsor.custom_order["Mail du responsable communication"],
            nomCompta: commandeSponsor.custom_order["Nom contact service comptabilité"],
            mailCompta: commandeSponsor.custom_order["Mail du service comptabilité"],
        },
        paiement: {
            status: commandeSponsor.order_paid === "1" ? 'PAYE' : 'NON_PAYE',
            montantTotalTTC: parseInt(commandeSponsor.order_price),
        },
        options: [],
        notes: ""
    }
}
