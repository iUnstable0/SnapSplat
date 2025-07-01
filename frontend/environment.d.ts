declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_NODE_ENV: "development" | "production" | "staging";

    PUBLIC_KEY: string;

    NEXT_PUBLIC_GQL_ENDPOINT: string;

    NEXT_PUBLIC_DOMAIN: string;
    NEXT_PUBLIC_URL: string;

    NEXT_PUBLIC_CFTS_SITE_KEY: string;
  }
}
