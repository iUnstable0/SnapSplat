interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  maxAge: number;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  domain?: string;
}

export const tokenCookieOpt: CookieOptions = {
  httpOnly: true,
  secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 8, // 8 days
  sameSite: "strict",
  path: "/",
  domain: process.env.NEXT_PUBLIC_DOMAIN
};

export const refreshTokenCookieOpt: CookieOptions = {
  httpOnly: true,
  secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 8, // 8 days
  sameSite: "strict",
  path: "/refresh",
  domain: process.env.NEXT_PUBLIC_DOMAIN
};
