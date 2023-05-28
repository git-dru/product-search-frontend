import React, {
  useState,
  useContext,
  ReactNode,
  createContext,
  useEffect,
} from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config";
import {
  authSelected,
  authSession,
  authUser,
} from "../redux/actions/userActions";
import { AppDispatch } from "../redux/store";

type AuthContextType = {
  csrf: string | undefined;
  getCsrfToken: () => void;
  getSession: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [csrf, setCSRF] = useState<string | undefined>(undefined);
  const dispatch: AppDispatch = useDispatch();

  const navigate = useNavigate();

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/user/csrf/`, {
        withCredentials: true,
      });
      const csrfToken = response.headers["x-csrftoken"];
      setCSRF(csrfToken);
    } catch (error) {
      console.error("Failed to retrieve CSRF token:", error);
      return null;
    }
  };

  const getSession = async () => {
    await axios
      .get(`${BASE_URL}/user/session/`, { withCredentials: true })
      .then((res) => {
        if (res.data.isAuthenticated) {
          const sort_by =
            res.data.sort_by[0] === "-"
              ? res.data.sort_by.slice(1)
              : res.data.sort_by;
          const direction = res.data.sort_by[0] === "-" ? "desc" : "asc";
          const selected = res.data.selected;
          dispatch(authSelected(selected.map(Number)));
          dispatch(authSession(res.data.search_term, sort_by, direction));
          whoami();
        } else {
          getCsrfToken();
        }
      });
  };

  const whoami = async () => {
    await axios
      .get(`${BASE_URL}/user/whoami/`, { withCredentials: true })
      .then((res) => {
        dispatch(authUser(res.data.email));
        navigate("/products");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getSession();
  }, []);

  return (
    <AuthContext.Provider value={{ csrf, getCsrfToken, getSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  return useContext(AuthContext);
};
