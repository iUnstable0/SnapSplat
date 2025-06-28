import axios from "axios";

import { cookies } from "next/headers";

type axiosOptions = {
  // headers?: Record<string, string>;
  data?: unknown;
  withAuth?: boolean;
};

export default class requester {
  // public static async;
  public static async request(options: axiosOptions) {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    // return axios.request({
    //   method: "POST",
    //   baseURL: process.env.NEXT_PUBLIC_GQL_ENDPOINT,
    //   headers: {
    //     "Content-Type": "application/json",

    //     ...(options.withAuth && token
    //       ? { Authorization: `Bearer ${token}` }
    //       : {}),
    //   },
    //   data: options.data,
    // });

    return axios
      .request({
        method: "POST",
        baseURL: process.env.NEXT_PUBLIC_GQL_ENDPOINT,
        headers: {
          "Content-Type": "application/json",

          ...(options.withAuth && token
            ? { Authorization: `Bearer ${token}` }
            : {}),
        },
        data: options.data,
      })
      .then((response) => {
        if ("errors" in response.data) {
          throw response.data.errors;
        }

        return response.data.data;
      })
      .catch((error) => {
        if ("response" in error) {
          throw {
            gql: true,
            data: error.response.data.errors,
          };
        }

        throw {
          gql: false,
          data: error,
        };
      });
  }
}
