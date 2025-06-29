declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "staging";

    DATABASE_URL: string;

    GQL_ENDPOINT: string;
    GQL_PORT: number;

    VALKEY_HOST: string;
    VALKEY_PORT: number;

    CACHE_ENABLED: boolean;

    PRIVATE_KEY: string;
    PUBLIC_KEY: string;

    CFTS_SECRET_KEY: string;
    CFTS_SITE_KEY: string;
  }
}
