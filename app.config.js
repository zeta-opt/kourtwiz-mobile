import 'dotenv/config';

export default {
  expo: {
    name: 'kourtwiz-mobile',
    slug: 'kourtwiz-mobile',
    version: '1.0.19',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'kourtwizmobile',
    userInterfaceStyle: 'automatic',

    updates: {
      url: 'https://u.expo.dev/0c917ae5-4e2b-4c2b-bef1-928702cf4737',
    },

    runtimeVersion: "1.0.19",

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.kourtwiz.mobile',
      buildNumber: '1.0.19',
      infoPlist: {
        NSContactsUsageDescription:
          'This app needs access to your contacts to let you invite or select players.',
        NSLocationWhenInUseUsageDescription:
          'This app needs your location to help you find nearby courts.',
      },
      config: {
        googleMapsApiKey: "AIzaSyC3JM_8P23tGrP6laoq7K8fIGI0DQxNSog", // ✅ iOS key goes here
      },
    },

    android: {
      package: 'com.kourtwiz.mobile',
      versionCode: 1,
      permissions: ['READ_CONTACTS', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: "AIzaSyDQvA6q1C1dt9JoOo-_6iG6mOGFozGfqwk", // ✅ Android key goes here
        },
      },
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