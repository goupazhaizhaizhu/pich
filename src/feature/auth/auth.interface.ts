export interface LoginParams {
  openId: string;
  originName: string;
  code: string;
}

export interface LoginResponse {
  accessToken: string;
  userInfo: {
    openId: string;
    username: string;
  };
}

export interface JwtInfo {
    sessionKey: string,
    vi: string,
    openId: string
}