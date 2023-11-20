import React, {useState, ReactNode} from "react";


type Props = {
    children?: ReactNode
}

type IAuthContext = {
    isLoggedIn: boolean;
    setIsLoggedIn: (param:boolean)=>void
}
const initValue = {
    isLoggedIn:false,
    setIsLoggedIn: ()=>{}
}
const AuthContext = React.createContext<IAuthContext>(initValue)



const AuthProvider = ({children}:Props)=>{
const [isLoggedIn, setIsLoggedIn] = useState(initValue.isLoggedIn)

return(<AuthContext.Provider value={{isLoggedIn, setIsLoggedIn}} >{children }</AuthContext.Provider>)
}


export {AuthContext, AuthProvider}