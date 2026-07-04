import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || "https://10.240.138.254",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "scenariobuilder",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "scenario-builder-api-frontend",
});

export default keycloak;
