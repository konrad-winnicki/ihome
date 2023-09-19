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

  findUserByEmail(userEmail: string): Promise<User|null> {
    return this.userInterface.findUserByEmail(userEmail);
  }

}
