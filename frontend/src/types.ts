// Shared type with frontend! Remmeber to update
export type JWTAuthPayload = {
  userId: string;
  passwordSession: string;
  accountSession: string;
  jti: string;
  iat: number;
  exp: number;
  aud: string;
};
