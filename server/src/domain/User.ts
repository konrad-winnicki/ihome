
export class User {
  readonly id:string;
  readonly email: string;
  readonly nickName: string;
  readonly password: string;
  readonly registrationDate: Date;

  constructor(id: string, email: string, password: string, nickName: string, registrationDate:Date) {
    this.id = id;
    this.email = email;
    this.nickName = nickName;
    this.password = password;
    this.registrationDate = registrationDate
  }

  

}
