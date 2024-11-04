export type UserType = {
  id: number;
  fullName: string;
  username: string;
};

export type UserFullType = { password: string } & UserType;

export type UserTokenType = {
  accessToken: string;
  refreshToken: string;
} & UserType;
