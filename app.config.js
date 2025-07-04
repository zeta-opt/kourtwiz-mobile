import 'dotenv/config';

export default {
  expo: {
    name: 'kourtwiz-mobile',
    slug: 'kourtwiz-mobile',
    version: '1.0.1', // User-facing version
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'kourtwizmobile',
    userInterfaceStyle: 'automatic',

    updates: {
      url: 'https://u.expo.dev/0c917ae5-4e2b-4c2b-bef1-928702cf4737',
    },

    runtimeVersion: {
      policy: 'appVersion', // Uses version field for runtime versioning (EAS Update compatible)
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.kourtwiz.mobile',
      buildNumber: '1.0.0', // Bump on each new iOS build
    },

    android: {
      package: 'com.kourtwiz.mobile',
      versionCode: 1,
      permissions: ['READ_CONTACTS'],
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      apiUrl: process.env.API_URL,
      router: {},
      eas: {
        projectId: '0c917ae5-4e2b-4c2b-bef1-928702cf4737',
      },
    },

    owner: 'ankitexponative',

    // ✅ Recommended for future EAS compatibility
    cli: {
      appVersionSource: 'local', // or 'remote' if managing from EAS dashboard
    },
  },
};
