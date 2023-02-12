require("dotenv").config();

if (process.env.BILLETWEB_API_KEY == null) {
  throw new Error("BILLETWEB_API_KEY has no value");
}
if (process.env["AUTH_DISABLED"] == "true") {
  console.warn("Starting without Admin Authentication");
}
export const CONFIG = {
  billetweb: {
    apiKey: process.env.BILLETWEB_API_KEY,
    user: "9964",
    // event: "524659", // 2022
    // event: "772240", // 2023-test
    event: "798592", // 2023-test-new
    // event: "790192", // 2023
  },
  isAuthDisabled: process.env["AUTH_DISABLED"] == "true",
};
