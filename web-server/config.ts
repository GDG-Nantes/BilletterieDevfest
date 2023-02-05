require("dotenv").config();

if (process.env.BILLETWEB_API_KEY == null) {
  throw new Error("BILLETWEB_API_KEY has no value");
}
export const CONFIG = {
  billetweb: {
    apiKey: process.env.BILLETWEB_API_KEY,
    user: "9964",
    // event: "524659" // 2022
    event: "772240",
  },
};
