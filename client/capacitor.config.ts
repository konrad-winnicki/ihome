import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mafasoft.iHome',
  appName: 'iHome',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
