import Mailgun from "mailgun.js";
import formData from "form-data";
import { CONFIG } from "../config";
import { Commande, ReservedStand } from "../interfaces/types";

const mailgun = new Mailgun(formData).client({
  username: "api",
  key: CONFIG.mailgun.apiKey,
  url: "https://api.eu.mailgun.net",
});

export async function sendEmail(to: string, cc: string[], subject: string, html: string) {
  try {
    const messagesSendResult = await mailgun.messages.create(CONFIG.mailgun.domain, {
      from: `Billetterie Devfest Nantes <billetterie@${CONFIG.mailgun.domain}>`,
      to: [to],
      cc: cc.join(","),
      subject,
      html,
    });
    console.log(
      `Email ${to} ${messagesSendResult.status}, ${messagesSendResult.details}, ${messagesSendResult.message}`
    );
  } catch (e) {
    console.error("Erreur lors de l'envoie de l'email", e);
    throw e;
  }
}

export function buildHtmlValidationEmail(dataIn: ReservedStand, commande: Commande) {
  return `
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
  <body>  
    <h2>Le choix de stand a bien été enregistré pour ${commande.acheteur.entreprise}</h2>
    <p>
      <strong>Stand :</strong> ${dataIn.idStand}
      <br>
      <strong>Moquette :</strong> ${dataIn.typeMoquette}
    </p>
    <br>
    <p>Retour à mon <a href="https://billetterie.gdgnantes.com/commande/${commande.extId}">espace de gestion de commande</a></p>
    <br>
    <h3>A bientôt pour la suite de l'aventure !</h3>
  </body>
</html>
`;
}
