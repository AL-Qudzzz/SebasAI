import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sebasai.app',
  appName: 'SebasAI',
  bundledWebRuntime: false,
  server: {
    url: "https://sebas-ai.vercel.app/", 
    cleartext: true
  }
};

export default config;
