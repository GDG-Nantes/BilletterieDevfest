import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RouterAdmin } from "./admin/router";
import { AuthenticationProvider } from "./auth";
import { CONFIG } from "./config";
import "./index.css";
import { RouterPartenaires } from "./partenaires/router";
import { ServiceProvider } from "./services";
import { ThemeDevfest } from "./layout/layout";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthenticationProvider clientId={CONFIG.authClientId}>
      <ServiceProvider>
        <ThemeDevfest>
          <BrowserRouter>
            <RouterPartenaires />
            <RouterAdmin />
          </BrowserRouter>
        </ThemeDevfest>
      </ServiceProvider>
    </AuthenticationProvider>
  </React.StrictMode>
);
