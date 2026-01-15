import type { ConfigContext, ExpoConfig } from "expo/config";
import * as fs from "fs";
import * as path from "path";

// Check if a file exists
function fileExists(filePath: string): boolean {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}

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

// Check if iOS Google Services plist exists (provided via EAS secrets at build time)
const iosGoogleServicesPath =
  process.env.GOOGLE_SERVICES_PLIST ?? "./GoogleService-Info.plist";
const hasIosGoogleServices = fileExists(iosGoogleServicesPath);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "LinkMind",
  slug: "linkmind",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "linkmind",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.alexchoi.bookmarksapp",
    // Only include googleServicesFile if the file exists (provided via EAS secrets at build time)
    ...(hasIosGoogleServices && {
      googleServicesFile: iosGoogleServicesPath,
    }),
    entitlements: {
      "aps-environment": "production",
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      // Required: preserve both Google Sign-In and app scheme for expo-share-intent
      // See: https://github.com/achorein/expo-share-intent#google-signin-and-cfbundleurlschemes
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            "com.googleusercontent.apps.62614773390-n8545fl3l7sd0rnhtn6gk3qj28ccg2ff",
            "linkmind",
          ],
        },
      ],
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
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
    [
      "expo-share-intent",
      {
        iosActivationRules: {
          NSExtensionActivationSupportsWebURLWithMaxCount: 1,
          NSExtensionActivationSupportsWebPageWithMaxCount: 1,
        },
        androidIntentFilters: ["text/*"],
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
