import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mafasoft.piManager',
  appName: 'piManager',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
