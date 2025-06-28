export const tokenCookieOpt = {
  httpOnly: false,
  secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
  maxAge: 60 * 60 * 3, // 3 hours
};

export const refreshTokenCookieOpt = {
  httpOnly: true,
  secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 8, // 8 days
};
