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

    const token = cookieStore.get("Authorization")?.value;

    return axios.request({
      method: "POST",
      baseURL: process.env.NEXT_PUBLIC_GQL_ENDPOINT,
      headers: {
        "Content-Type": "application/json",

        ...(options.withAuth && token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      data: options.data,
    });
  }
}
