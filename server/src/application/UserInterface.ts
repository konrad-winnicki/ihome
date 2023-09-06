import { User } from "../domain/User";

export interface UserInterface {
  createUser(userDetails: User): Promise<string>;
 // changeName(playerId: string, newName: string): Promise<Partial<Player>>;
  findUser(userId: string): Promise<User>;
  findUserByEmail(userEmail: string): Promise<User>;
  //getUserList(): Promise<UserList>;
}
