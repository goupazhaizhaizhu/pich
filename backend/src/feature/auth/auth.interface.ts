export interface LoginParams {
  code: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userInfo: {
    username: string;
  };
}

export interface RefreshParams {
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
