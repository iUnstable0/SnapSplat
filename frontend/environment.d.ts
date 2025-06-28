declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_NODE_ENV: "development" | "production" | "staging";

    PUBLIC_KEY: string;

    NEXT_PUBLIC_GQL_ENDPOINT: string;

    CFTS_SITE_KEY: string;
  }
}
