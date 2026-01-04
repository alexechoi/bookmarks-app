import type { ConfigContext, ExpoConfig } from "expo/config";
import * as fs from "fs";
import * as path from "path";

// Extract webClientId from google-services.json (client_type 3 = web client)
function getWebClientId(): string | undefined {
  try {
    const googleServicesPath =
      process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json";
    const fullPath = path.resolve(__dirname, googleServicesPath);
    const content = fs.readFileSync(fullPath, "utf-8");
    const googleServices = JSON.parse(content) as {
      client?: {
        oauth_client?: { client_type: number; client_id: string }[];
      }[];
    };
    const oauthClients = googleServices.client?.[0]?.oauth_client;
    const webClient = oauthClients?.find((client) => client.client_type === 3);
    return webClient?.client_id;
  } catch {
    console.warn("Could not read webClientId from google-services.json");
    return undefined;
  }
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "LinkMind",
  slug: "linkmind",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "expoapp",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "xyz.alexchoi.bookmarksapp",
    googleServicesFile:
      process.env.GOOGLE_SERVICES_PLIST ?? "./GoogleService-Info.plist",
    entitlements: {
      "aps-environment": "production",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    package: "xyz.alexchoi.bookmarksapp",
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    permissions: ["NOTIFICATIONS"],
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
    "@react-native-google-signin/google-signin",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
          deploymentTarget: "15.1",
          buildReactNativeFromSource: true,
        },
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "7b43ef7a-da56-46b5-a970-2f273c8e9690",
    },
    webClientId: getWebClientId(),
  },
  owner: "alexchhk",
});
