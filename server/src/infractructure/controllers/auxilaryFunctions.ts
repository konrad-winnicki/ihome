import { UserService } from "../../application/UserService";
import qs from "qs";
import axios from "axios";
import sanitizedConfig from "../../../config/config";
import jwt from "jsonwebtoken";
import { User } from "../../domain/User";
import { v4 } from "uuid";
import { GoogleIdToken } from "../../../types";

export function prepareCustomToken(userId: string, nickName: string): string {
  const token = jwt.sign({ userId, nickName }, sanitizedConfig.JWT_SECRET, {
    expiresIn: "60s",
  });
  return token;
}

export async function exchangeCodeToToken(code: string) {
  const url = sanitizedConfig.EXCHANGE_TOKEN_URI;
  const values = {
    code,
    client_id: sanitizedConfig.CLIENT_ID,
    client_secret: sanitizedConfig.CLIENT_SECRET,
    redirect_uri: sanitizedConfig.CALLBACK_URL,
    grant_type: "authorization_code",
  };

  try {
    const response = await axios.post(url, qs.stringify(values), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data;
  } catch (error) {
    throw new Error("Code exchange failed");
  }
}

export const createUserWithGoogleData = async (
  userService: UserService,
  decodedIdToken: GoogleIdToken
) => {
  const user = await userService.findUserByEmail(decodedIdToken.email);
  if (!user) {
    const id = v4();
    const registrationDate = new Date();
    const newUser = new User(
      id,
      decodedIdToken.email,
      decodedIdToken.given_name,
      registrationDate,
      null
    );
    userService.createUser(newUser);
    return { id, nickName: decodedIdToken.given_name };
  }
  return { id: user.id, nickName: user.nickName };
};
