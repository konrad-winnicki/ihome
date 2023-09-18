
export class User {
  readonly id:string;
  readonly email: string;
  readonly nickName: string;
  readonly password: string | null;
  readonly registrationDate: Date;

  constructor(id: string, email: string,  nickName: string, registrationDate:Date, password: string |null,) {
    this.id = id;
    this.email = email;
    this.nickName = nickName;
    this.password = password;
    this.registrationDate = registrationDate
  }

  

}
