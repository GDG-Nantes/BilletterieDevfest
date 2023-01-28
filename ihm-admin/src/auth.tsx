import { GoogleOAuthProvider, useGoogleOneTapLogin } from "@react-oauth/google";
import React from "react";
import { Outlet } from "react-router-dom";

type User = {
  token?: string;
};

const userContext = React.createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({} as any);

export const AuthenticationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = React.useState<User | null>(null);

  return (
    <GoogleOAuthProvider clientId="94669066373-92okun8fp55t7tm9lehp69ekc8vnn9m5.apps.googleusercontent.com">
      <userContext.Provider value={{ user, setUser }}>
        {children}
      </userContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useUser = (): User | null => {
  const { user } = React.useContext(userContext);
  return user;
};

export const Authenticated = () => {
  const { setUser } = React.useContext(userContext);

  useGoogleOneTapLogin({
    onSuccess: (credentialResponse) => {
      console.log(credentialResponse);
      setUser({ token: credentialResponse.credential });
    },
    onError: () => {
      setUser(null);
      console.log("Login Failed");
    },
  });

  return <Outlet />;
};
