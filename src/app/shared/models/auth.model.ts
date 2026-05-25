export interface JwtPayload {
  id?: string;
  sub?: string;
  email?: string;
  idrole: number;
  exp?: number;
}

export interface LoginResponse {
  response: string;
  role: string;
  idrole: number;
}

export interface AuthSession {
  token: string;
  roleId: number;
  userName: string;
  payload: JwtPayload;
}