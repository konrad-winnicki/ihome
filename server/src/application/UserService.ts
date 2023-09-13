import { User } from "../domain/User";
import { UserInterface } from "./UserInterface";

export class UserService {
  userInterface: UserInterface;
  constructor(userInterface: UserInterface) {
    this.userInterface = userInterface;
  }

  createUser(userDetails: User): Promise<string> {
    return this.userInterface.createUser(userDetails);
  }

  //changeName(playerId: string, newName: string): Promise<Partial<Player>> {
  //   return this.playerInterface.changeName(playerId, newName);
  // }

  findUser(userId: string): Promise<User> {
    return this.userInterface.findUser(userId);
  }

  findUserByEmail(userEmail: string): Promise<User> {
    return this.userInterface.findUserByEmail(userEmail);
  }

  // getPlayerList(): Promise<PlayerList> {
  //  return this.playerInterface.getPlayerList();
  //}
}
