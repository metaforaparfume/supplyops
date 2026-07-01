import { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.supplyops.app",
  appName: "SupplyOps",
  webDir: "out",
  server: {
    url: "https://supplyops-five.vercel.app",
    cleartext: true,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
    },
  },
}

export default config
