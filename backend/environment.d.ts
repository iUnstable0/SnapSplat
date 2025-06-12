declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "staging";

    DATABASE_URL: string;
    GQL_PORT: number;

    PRIVATE_KEY: string;
    PUBLIC_KEY: string;

    CFTS_SECRET_KEY: string;
    CFTS_SITE_KEY: string;
  }
}
