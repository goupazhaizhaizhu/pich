export interface LoginParams {
  openId: string;
  originName: string;
  code: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userInfo: {
    openId: string;
    username: string;
  };
}

export interface RefreshParams {
  openId: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenItem {
  refreshToken: string;
  expiredIn: number;
}

export interface JwtInfo {
    sessionKey: string,
    vi: string,
    openId: string
}