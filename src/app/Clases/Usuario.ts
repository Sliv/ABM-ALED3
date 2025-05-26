export class Usuario {

  public _id!: number;
  public get id(): number {
    return this._id;
  }
  public set id(v: number) {
    this._id = v;
  }

  public _nombre!: string;
  public get nombre(): string {
    return this._nombre;
  }
  public set nombre(v: string) {
    this._nombre = v;
  }

  public _apellido!: string;
  public get apellido(): string {
    return this._apellido;
  }
  public set apellido(v: string) {
    this._apellido = v;
  }

  public _email!: string;
  public get email(): string {
    return this._email;
  }
  public set email(v: string) {
    this._email = v;
  }

  public _password!: string;
  public get password(): string {
    return this._password;
  }
  public set password(v: string) {
    this._password = v;
  }

  public _rol!: string;
  public get rol(): string {
    return this._rol;
  }
  public set rol(v: string) {
    this._rol = v;
  }

  public _fechaNacimiento!: Date;
  public get fechaNacimiento(): Date {
    return this._fechaNacimiento;
  }
  public set fechaNacimiento(v: Date) {
    this._fechaNacimiento = v;
  }

  public _telefono!: string;
  public get telefono(): string {
    return this._telefono;
  }
  public set telefono(v: string) {
    this._telefono = v;
  }

  public _direccion!: string;
  public get direccion(): string {
    return this._direccion;
  }
  public set direccion(v: string) {
    this._direccion = v;
  }
}