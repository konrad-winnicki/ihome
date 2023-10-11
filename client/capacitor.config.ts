import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "mafasoft.pimanager",
  appName: "PiManager",
  webDir: "dist",
  server: {
    androidScheme: "http"
  },
};

export default config;
