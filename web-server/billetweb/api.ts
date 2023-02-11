import axios from "axios";
import { CONFIG } from "../config";
import { Commande, OptionsPack, TypePack } from "../interfaces/types";
import { Attendee } from "./types-billetweb";

const axiosClientBilletWeb = axios.create({
  baseURL: `https://billetweb.fr/api/event/${CONFIG.billetweb.event}/`,
  // En théorie on peut envoyer de la basic auth, mais ça n'a pas l'air de marcher
  // auth: {
  //   username: CONFIG.billetweb.user,
  //   password: CONFIG.billetweb.apiKey,
  // },
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

  // WIP, impossible de le faire marcher pour le moment
  // peut être lié au fait de faire passer l'authent par queryParams
  // en debug, l'objet request qui revient de billetweb est un GET et pas un POST
  marquerCommePaye: async (idCommande: string, estPaye: boolean) => {
    return axiosClientBilletWeb.post(
      `update_order`,
      {
        data: [
          {
            id: idCommande,
            accredited: 3,
            notification: 0,
          },
        ],
      },
      {
        headers: {
          "Content-type": "application/json",
        },
      }
    );
  },
};

function convertirAttendeesEnCommandes(attendees: Attendee[]) {
  const commandes: { [id: string]: Commande } = {};
  // On récupère d'abord toutes les demandes de partenariats
  attendees
    .filter((attendee) => calculerTypeTicket(attendee.ticket) === "PARTENAIRE")
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
    if (commande == null && attendee.category !== "Choix du stand") {
      commande = Object.values(commandes).find(
        (commande) =>
          commande.acheteur.entreprise === attendee.custom_order.Entreprise
      ) as Commande | null;

      // Si on trouve une commande fait par la même entreprise, on ajoute au montant et une note pour s'y retrouver
      if (commande != null) {
        commande.paiement.montantTotalTTC += parseInt(attendee.price);
        commande.notes += `Liée à la commande ${attendee.order_ext_id}
                    `;
      }
    }

    // Dans la plupart des cas, les options auront été prises avec le partenariat
    // il suffit alors d'enrichir la commande existante
    if (commande != null) {
      switch (typeTicket) {
        case "PLATINIUM":
        case "VIRTUEL":
        case "GOLD":
        case "SILVER":
        case "SPECIAL":
          // la condition permet de s'assurer qu'un sponsor déjà flagué PXL ne sera pas reflagué Platinium par exemple
          if (commande.typePack === "UNKNOWN") {
            commande.typePack = typeTicket;
          }
          break;
        case "ANNUEL":
        case "INTERNET_16Mbps":
        case "ELECTRICITE_6kW":
          commande.options.push(typeTicket);
          break;
        case "PLATINIUM_XL":
        case "AFTER":
          commande.typePack = typeTicket;
          break;
      }
    } else if (attendee.category !== "Choix du stand") {
      console.error("Erreur de l'analyse de la commande", attendee);
    }
  });

  return Object.values(commandes);
}

function calculerTypeTicket(
  ticket: string
): OptionsPack | TypePack | "PARTENAIRE" {
  const regexpTypeTicket: {
    [r: string]: OptionsPack | TypePack | "PARTENAIRE";
  } = {
    "Pack Platinium - 18m2": "PLATINIUM",
    "Pack Gold - 12m2": "GOLD",
    "Pack Silver - 9m2": "SILVER",
    "Pack Virtuel - Pas de stand": "VIRTUEL",
    "Pack Special - 12m2": "SPECIAL",

    AfterParty: "AFTER",
    "Option PXL": "PLATINIUM_XL",
    "Electricité : 6KW à la place de 3KW": "ELECTRICITE_6kW",
    "Partenaire annuel GDG Nantes": "ANNUEL",
    "Internet : Connexion filaire 16Mbps": "INTERNET_16Mbps",

    "Partenaire Devfest": "PARTENAIRE",
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
    notes: "",
  };
}
