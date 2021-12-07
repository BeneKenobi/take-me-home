import 'dotenv/config';

export default ({ config }) => {
  if (process.env.GOOGLE_API_KEY_WEB != undefined) {
    config.extra = {
      ...config.extra,
      googleApiKeyWeb: process.env.GOOGLE_API_KEY_WEB,
    };
  }
  if (process.env.GOOGLE_API_KEY_IOS != undefined) {
    config.extra = {
      ...config.extra,
      googleApiKeyIos: process.env.GOOGLE_API_KEY_IOS,
    };
  }
  if (process.env.GOOGLE_API_KEY_ANDROID != undefined) {
    config.extra = {
      ...config.extra,
      googleApiKeyAndroid: process.env.GOOGLE_API_KEY_ANDROID,
    };
  }

  return {
    ...config,
  };
};
