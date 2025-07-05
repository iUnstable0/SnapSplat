declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "staging";

    SETUP_KEY: string;

    DATABASE_URL: string;

    NEXT_URL: string;

    GQL_PORT: number;

    VALKEY_HOST: string;
    VALKEY_PORT: number;

    CACHE_ENABLED: boolean;

    PRIVATE_KEY: string;
    PUBLIC_KEY: string;

    CFTS_SECRET_KEY: string;
    CFTS_SITE_KEY: string;

    S3_ACCESS_KEY_ID: string;
    S3_SECRET_ACCESS_KEY: string;
    S3_ENDPOINT_URL: string;
    S3_BUCKET_NAME: string;
  }
}
