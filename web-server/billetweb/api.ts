import axios from "axios";
import { CONFIG } from "../config";
import { Commande, OptionsPack, TypePack } from "../interfaces/types";
import { Attendee } from "./types-billetweb";

const axiosClientBilletWeb = axios.create({
  baseURL: `https://www.billetweb.fr/api/event/${CONFIG.billetweb.event}/`,
  params: {
    user: CONFIG.billetweb.user,
    key: CONFIG.billetweb.apiKey,
    version: 1,
  },
});
axiosClientBilletWeb.interceptors.response.use(
  (value) => {
    // Bravo à Billetweb pour cette API qui renvoie 200 même en cas d'erreur
    if (value.data.error) {
      return Promise.reject(new Error(JSON.stringify(value.data)));
    }
    return value;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const BilletWebApi = {
  listerCommandes: async function (): Promise<Commande[]> {
    const response = await axiosClientBilletWeb.get<Attendee[]>("attendees");
    const attendees: Attendee[] = response.data;

    return convertirAttendeesEnCommandes(attendees);
  },

  consulterCommande: async function (idCommande: string): Promise<Commande> {
    const response = await axiosClientBilletWeb.get<Attendee[]>("attendees");
    const attendees: Attendee[] = response.data.filter(
      (attendee) => attendee.order_ext_id === idCommande
    );

    return convertirAttendeesEnCommandes(attendees)[0];
  },

  // WIP, impossible de le faire marcher pour le moment
  // peut être lié au fait de faire passer l'authent par queryParams
  // en debug, l'objet request qui revient de billetweb est un GET et pas un POST
  marquerCommePaye: async (idCommande: string) => {
    const res = await axiosClientBilletWeb.post(
      `pay_order`,
      {
        data: [
          {
            id: parseInt(idCommande),
            payment_type: "other",
            notification: 1,
          },
        ],
      },
      {
        headers: {
          "Content-type": "application/json",
        },
      }
    );
    if (res.data.length === 0) {
      throw new Error(
        `Erreur lors de l'appel à Billetweb pour la commande ${idCommande}`
      );
    }
  },
};

function convertirAttendeesEnCommandes(attendees: Attendee[]) {
  const commandes: { [id: string]: Commande } = {};
  // On récupère d'abord toutes les demandes de partenariats
  attendees
    .filter((attendee) =>
      LISTE_TYPES_PACK.includes(calculerTypeTicket(attendee.ticket) as TypePack)
    )
    .forEach((attendee) => {
      if (commandes[attendee.order_id] == null) {
        commandes[attendee.order_id] = initialiserCommande(attendee);
      }
    });

  // On enrichi ensuite avec toutes les options qu'on trouve
  attendees.forEach((attendee) => {
    const typeTicket = calculerTypeTicket(attendee.ticket);
    let commande: Commande | null = commandes[attendee.order_id];

    // Les sponsors peuvent avoir acheté une option après le premier achat qui contenait le partenariat
    // dans ce cas là, le lien est fait par le champ entreprise
    if (commande == null) {
      commande = Object.values(commandes).find(
        (commande) =>
          commande.acheteur.entreprise === attendee.custom_order.Entreprise
      ) as Commande | null;

      // Si on trouve une commande fait par la même entreprise, on ajoute au montant et une note pour s'y retrouver
      // Sinon c'est le cas d'un sponsor After qui n'est pas platinium par exemple
      commandes[attendee.order_id] = initialiserCommande(attendee);

      if (commande != null) {
        commandes[attendee.order_id].commandesLiees.push({
          ...commande,
          commandesLiees: [],
        });
        commande.commandesLiees.push({
          ...commandes[attendee.order_id],
          commandesLiees: [],
        });
      } else {
        commande = commandes[attendee.order_id];
      }
    }

    // Dans la plupart des cas, les options auront été prises avec le partenariat
    // il suffit alors d'enrichir la commande existante
    if (commande != null) {
      if (LISTE_TYPES_PACK.includes(typeTicket as TypePack)) {
        commande.typePack = typeTicket as TypePack;
      } else if (LISTE_OPTIONS.includes(typeTicket as OptionsPack)) {
        commande.options.push(typeTicket as OptionsPack);
      }
    } else if (attendee.category !== "Choix du stand") {
      console.error("Erreur de l'analyse de la commande", attendee);
    }
  });

  return Object.values(commandes);
}

export const LISTE_TYPES_PACK: TypePack[] = [
  "PLATINIUM",
  "GOLD",
  "SILVER",
  "VIRTUEL",
  "JOBBOARD",
  "VELOTYPIE",
];

export const LISTE_OPTIONS: OptionsPack[] = [
  "PLATINIUM_XL",
  "AFTER",
  "ANNUEL",
  "ELECTRICITE_21kW",
  "ELECTRICITE_6kW",
  "INTERNET_16Mbps",
];

function calculerTypeTicket(ticket: string): OptionsPack | TypePack | "IGNORE" {
  const regexpTypeTicket: {
    [r: string]: OptionsPack | TypePack | "IGNORE";
  } = {
    "Partenaire Jobboard": "JOBBOARD",
    "Pack Partenaire Vélotypie": "VELOTYPIE",
    "Pack Partenaire Devfest - Virtuel": "VIRTUEL",
    "Pack Partenaire Devfest - Silver": "SILVER",
    "Pack Partenaire Devfest - Gold": "GOLD",
    "Pack Partenaire Devfest - Platinium": "PLATINIUM",

    "Pack Partenaire AfterParty": "AFTER",
    "Option PXL": "PLATINIUM_XL",
    "Partenaire annuel GDG Nantes": "ANNUEL",
    "Internet : Connexion filaire 16Mbps": "INTERNET_16Mbps",
    "Electricité : second bloc électrique de 3KW": "ELECTRICITE_6kW",
    "Electricité : Bloc de 21 KW à la place de 3 KW": "ELECTRICITE_21kW",

    // Pour information, les autres éléments de billetweb
    "AfterParty 1/2": "IGNORE",
    "AfterParty 2/2": "IGNORE",
    "Pas de stand": "IGNORE",
    "Stand 9m2": "IGNORE",
    "Stand 12m2": "IGNORE",
    "Stand 18m2": "IGNORE",
    "Electricité : 3KW": "IGNORE",
    "Afterparty - Logistique": "IGNORE",
    "Pass 2 jours Devfest Nantes": "IGNORE",
    "Diffusion d'offre d'emploi": "IGNORE",
    "Votre logo sur la page partenaire du Devfest": "IGNORE",
    "Votre logo sur le site du Devfest": "IGNORE",
    "Communication sur nos réseaux sociaux": "IGNORE",
    "Article de votre choix dans notre newsletter et le blog du site web du Devfest":
      "IGNORE",
  };
  return selectValueByRegexp(ticket, regexpTypeTicket) || "UNKNOWN";
}

function selectValueByRegexp<T>(
  label: string,
  regexpValues: { [r: string]: T }
): T | null {
  const entryTypePack: [string, T] | undefined = Object.entries(
    regexpValues
  ).filter(([r]) => new RegExp(r, "i").test(label))[0];
  if (entryTypePack != null) {
    return entryTypePack[1];
  }
  return null;
}

function initialiserCommande(commandeSponsor: Attendee): Commande {
  return {
    id: commandeSponsor.order_id,
    extId: commandeSponsor.order_ext_id,
    dateAchat: commandeSponsor.order_date,
    status: "VALIDE",
    lienGestionCommande: commandeSponsor.order_management,
    typePack: "UNKNOWN",
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
      mailCom:
        commandeSponsor.custom_order["Mail du responsable communication"],
      nomCompta:
        commandeSponsor.custom_order["Nom contact service comptabilité"],
      mailCompta: commandeSponsor.custom_order["Mail du service comptabilité"],
    },
    paiement: {
      status: commandeSponsor.order_paid === "1" ? "PAYE" : "NON_PAYE",
      montantTotalTTC: parseInt(commandeSponsor.order_price),
    },
    options: [],
    commandesLiees: [],
    notes: "",
  };
}
