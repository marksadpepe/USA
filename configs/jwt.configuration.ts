import { registerAs } from "@nestjs/config";

export const JWT_CONF_KEY = "jwt";

export type JWTConfigType = {
  secret: string;
  expiresIn: number;
};

export default registerAs(JWT_CONF_KEY, (): JWTConfigType => {
  const { JWT_TTL, JWT_SECRET } = process.env;
  if (!JWT_SECRET) {
    throw new Error("The JWT secret key was not specified");
  }

  const parsedTtl = parseInt(JWT_TTL ?? "");
  if (typeof parsedTtl !== "number" || isNaN(parsedTtl)) {
    throw new Error("Incorrect JWT ttl value format");
  }

  return { secret: JWT_SECRET, expiresIn: parsedTtl };
});
