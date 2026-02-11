export default {
  expo: {
    name: "library_v2",
    slug: "library_v2",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "com.mlgcl.library",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mlgcl.library",
      NSCameraUsageDescription: "We need camera access",
    },

    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.mlgcl.library",
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
      "expo-web-browser",
      "@react-native-google-signin/google-signin",
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      PORTAL_API_KEY: process.env.PORTAL_API_KEY,
      PORTAL_URL: process.env.PORTAL_URL,
      PORTAL_ORIGIN: process.env.PORTAL_ORIGIN,
      LIBRARY_API_KEY: process.env.LIBRARY_API_KEY, 
      LIBRARY_API_URL: process.env.LIBRARY_API_URL,
      LIBRARY_ORIGIN: process.env.LIBRARY_ORIGIN,
      router: {},
      eas: {
        projectId: "d9580994-c9c9-4df6-90fd-efe143f44ee0",
      },
    },
  },
};