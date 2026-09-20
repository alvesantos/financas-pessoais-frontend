export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Session {
  token: string;
  expires_at: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}
