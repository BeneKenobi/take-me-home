import 'dotenv/config';

export default ({ config }) => {
    config.extra = { ...config.extra, googleApiKey: process.env.GOOGLE_API_KEY }

    return {
      ...config,
    };
  };
