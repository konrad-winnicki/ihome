import { ReactNode, createContext, useState } from "react";

type Props = {
  children?: ReactNode;
};

export type AuthContextValue = {
  isLoggedIn: boolean;
  setLoggedIn: (newParam: boolean) => void;
};

export const AuthorizationContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  setLoggedIn: () => {},
});





export const AuthContextProvider = ({ children }: Props) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  return (
    <div>
      <AuthorizationContext.Provider
        value={{ isLoggedIn, setLoggedIn }}
      >
        {children}
      </AuthorizationContext.Provider>
    </div>
  );
};
