import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.my360garage.app',
  appName: 'My360Garage',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    backgroundColor: '#090a0f',
    buildOptions: {
      keystorePath: undefined,
      releaseType: 'APK'
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
