export interface UserModel {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  estadoUsuario: boolean;
  imagen?: string | null;
  password?: string;
  idrole: number;
}