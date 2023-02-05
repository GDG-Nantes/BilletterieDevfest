import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Authenticated, AuthenticationProvider } from "./auth";
import { CONFIG } from "./config";
import "./index.css";
import { ServiceProvider } from "./services";
import { Sponsors } from "./sponsors";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthenticationProvider clientId={CONFIG.authClientId}>
      <ServiceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<div>Accueil Partenaire</div>} />
            <Route path="/admin/*" element={<Authenticated />}>
              <Route index element={<Sponsors />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ServiceProvider>
    </AuthenticationProvider>
  </React.StrictMode>
);