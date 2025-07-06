import axios from "axios";

// import { cookies } from "next/headers";

// import { redirect } from "next/navigation";
// import { NextResponse } from "next/server";

type axiosOptions = {
  // headers?: Record<string, string>;
  data?: unknown;
  withAuth?: boolean;
};

export default class requester {
  // public static async;
  public static async request(options: axiosOptions, token?: string) {
    // const cookieStore = await cookies();

    // const token = cookieStore.get("token")?.value;

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
          if (error.response.status === 401) {
            if (error.response.headers["x-refresh-token-needed"] === "true") {
              throw {
                redirect: "/refresh",
              };
            }

            throw {
              redirect: "/logout",
            };
          }

          if (error.response.status === 403) {
            throw {
              redirect: "/forbidden",
            };
          }

          throw {
            status: error.response.status,
            errors: error.response.data.errors,
          };
        }

        throw {
          status: 0,
          errors: [error],
        };
      });
  }
}
