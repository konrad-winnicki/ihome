import React, { useState, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

type IAuthorizationContext = {
  isLoggedIn: boolean;
  setIsLoggedIn: (param: boolean) => void;
};
const initValue = {
  isLoggedIn: false,
  setIsLoggedIn: () => {},
};
const AuthorizationContext =
  React.createContext<IAuthorizationContext>(initValue);

const AuthProvider = ({ children }: Props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(initValue.isLoggedIn);

  return (
    <AuthorizationContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthorizationContext.Provider>
  );
};

export { AuthorizationContext, AuthProvider };
