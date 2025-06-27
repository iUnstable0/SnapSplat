// import { cookies } from "next/headers";

import query_user from "./query/user";
// import mutation_user from "./mutation/user";

export default {
  query: {
    user: () => query_user.getAuthenticatedInfo(),
  },
  mutation: {},
};
