import Bun from "bun";

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

export default class GQL {
	public static async start() {
		const schema = await Bun.file("./src/gql/schema.gql").text();


	}
}