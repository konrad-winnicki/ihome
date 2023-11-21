import { ReactNode, createContext, useState } from "react";

type Props = {
  children?: ReactNode;
};


  export type AuthContextValue = {
    isLoggedIn: boolean;
    setIsLoggedIn: (newParam: boolean) => void;
  };
  
  export const AuthorizationContext = createContext<AuthContextValue>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
  });



export const AuthContextProvider = ({ children }: Props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <div>
      <AuthorizationContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        {children}
      </AuthorizationContext.Provider>
    </div>
  );
};
