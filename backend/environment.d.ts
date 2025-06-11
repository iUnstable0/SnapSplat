declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: "development" | "production" | "staging";

		DATABASE_URL: string;
	}
}
