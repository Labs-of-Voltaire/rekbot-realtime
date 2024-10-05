declare namespace NodeJS {
    interface ProcessEnv {
      LIVEKIT_URL: string;
      LIVEKIT_API_KEY: string;
      LIVEKIT_API_SECRET: string;
      OPENAI_API_KEY: string;
      NODE_ENV: 'development' | 'production';
    }
  }