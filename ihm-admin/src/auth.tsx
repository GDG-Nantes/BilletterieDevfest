import {
  CredentialResponse,
  GoogleLogin,
  GoogleOAuthProvider,
  useGoogleOneTapLogin,
} from "@react-oauth/google";
import jwtDecode, { JwtPayload } from "jwt-decode";
import React from "react";
import { Outlet } from "react-router-dom";

type User = {
  credential?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

const userContext = React.createContext<{
  user: User | null;
  setCredential: (credential?: string | null) => void;
}>({} as any);

const STORAGE_KEY_CREDENTIAL = "credentials";
type GoogleTokenData = JwtPayload & {
  given_name: string;
  family_name: string;
  email: string;
};

export const AuthenticationProvider: React.FC<
  React.PropsWithChildren & { clientId: string }
> = ({ children, clientId }) => {
  const [user, _setUser] = React.useState<User | null>(() => {
    const storedCredential = sessionStorage.getItem(STORAGE_KEY_CREDENTIAL);
    if (storedCredential != null) {
      try {
        const tokenData = jwtDecode(storedCredential) as GoogleTokenData;
        console.log(tokenData);
        if (tokenData.exp && tokenData.exp * 1000 > Date.now()) {
          return {
            credential: storedCredential,
            firstName: tokenData.given_name,
            lastName: tokenData.family_name,
            email: tokenData.email,
          };
        }
      } catch (error) {
        console.error(error);
        return null;
      }
    }
    return null;
  });

  function setCredential(credential?: string | null) {
    if (credential == null) {
      sessionStorage.removeItem(STORAGE_KEY_CREDENTIAL);
    } else {
      sessionStorage.setItem(STORAGE_KEY_CREDENTIAL, credential);
    }
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <userContext.Provider value={{ user, setCredential }}>
        {children}
      </userContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useUser = (): User | null => {
  const { user } = React.useContext(userContext);
  return user;
};

export const Authenticated: React.FC<{ optional?: boolean }> = ({
  optional,
}) => {
  const { setCredential, user } = React.useContext(userContext);

  const onSuccess = (credentialResponse: CredentialResponse) => {
    setCredential(credentialResponse.credential);
  };

  const onError = () => {
    setCredential(null);
    console.log("Login Failed");
  };

  if (user == null) {
    if (optional) {
      useGoogleOneTapLogin({
        onSuccess,
        onError,
      });
    } else {
      return (
        <GoogleLogin onSuccess={onSuccess} onError={onError} auto_select />
      );
    }
  }

  return <Outlet />;
};
