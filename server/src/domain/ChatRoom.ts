import { User } from "./User";

export class ChatRoom {
    readonly id:string;
    readonly name: string;
    readonly ownerId:string
    private _participants: Array<User>;
    readonly creationDate: Date;
  
    constructor(id: string, name: string, ownerId: string, _participants:Array<User>, creationDate:Date) {
      this.id = id;
      this.name = name;
      this.ownerId = ownerId;
      this._participants = _participants;
      this.creationDate= creationDate;
    }
  
    set participants(user:User){
        this._participants.push(user)
    }

    get participants(): Array<User>{
        return this._participants
    }
    
  
  }