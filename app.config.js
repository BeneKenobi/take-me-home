import 'dotenv/config';

export default ({ config }) => {
  const newConfig = config;
  if (process.env.GOOGLE_API_KEY_WEB !== undefined) {
    newConfig.extra = {
      ...newConfig.extra,
      googleApiKeyWeb: process.env.GOOGLE_API_KEY_WEB,
    };
  }
  if (process.env.GOOGLE_API_KEY_IOS !== undefined) {
    newConfig.extra = {
      ...newConfig.extra,
      googleApiKeyIos: process.env.GOOGLE_API_KEY_IOS,
    };
  }
  if (process.env.GOOGLE_API_KEY_ANDROID !== undefined) {
    newConfig.extra = {
      ...newConfig.extra,
      googleApiKeyAndroid: process.env.GOOGLE_API_KEY_ANDROID,
    };
  }

  return {
    ...newConfig,
  };
};
