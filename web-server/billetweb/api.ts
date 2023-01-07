import {CONFIG} from "../config";
import axios from "axios";
import Attendee = Attendees.Attendee;

const axiosClientBilletWeb = axios.create({
    baseURL: `https://billetweb.fr/api/event/${CONFIG.billetweb.event}/`,
    params: {
        user: CONFIG.billetweb.user,
        key: CONFIG.billetweb.apiKey,
        version: 1
    }
})

export const BilletWebApi = {
    getSponsors: async function () {
        let attendees = (await axiosClientBilletWeb.get<Attendee[]>('attendees')).data;

        const commandes
    }

}

function isCommandeSponsor(attendee: Attendee): boolean {
    return attendee.ticket.startsWith("Pack ")
}