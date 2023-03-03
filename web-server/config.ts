import { config } from "dotenv";

config();

if (process.env.BILLETWEB_API_KEY == null) {
  throw new Error("BILLETWEB_API_KEY has no value");
}
if (process.env["AUTH_DISABLED"] == "true") {
  console.warn("Starting without Admin Authentication");
}
const localEvent = "790192"; // 2023
// const localEvent = "798592" // 2023-test
export const CONFIG = {
  billetweb: {
    apiKey: process.env.BILLETWEB_API_KEY,
    user: "9964",
    event: process.env.BILLETWEB_EVENT_ID || localEvent,
  },
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: "mg2.gdgnantes.com",
  },
  google: {
    projectId: process.env["GOOGLE_PROJECT_ID"],
  },
  isAuthDisabled: process.env["AUTH_DISABLED"] == "true",
};
