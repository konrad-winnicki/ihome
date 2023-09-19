
export class ChatRoom {
    readonly id:string;
    readonly name: string;
    readonly ownerId:string
    readonly creationDate: Date;
  
    constructor(id: string, name: string, ownerId: string, creationDate:Date) {
      this.id = id;
      this.name = name;
      this.ownerId = ownerId;
      this.creationDate= creationDate;
    }   
  
  }