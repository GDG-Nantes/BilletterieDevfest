import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RouterAdmin } from "./admin/router";
import { AuthenticationProvider } from "./auth";
import { CONFIG } from "./config";
import "./index.css";
import { RouterPartenaires } from "./partenaires/router";
import { ServiceProvider } from "./services";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthenticationProvider clientId={CONFIG.authClientId}>
      <ServiceProvider>
        <BrowserRouter>
          <RouterPartenaires />
          <RouterAdmin />
        </BrowserRouter>
      </ServiceProvider>
    </AuthenticationProvider>
  </React.StrictMode>
);
