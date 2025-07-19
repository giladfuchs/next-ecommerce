"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { LinearProgress } from "@mui/material";


const LoadingContext = createContext({ loading: false });
export const useLoading = () => useContext(LoadingContext);

type Callback = (loading: boolean) => void;
let subscribers: Callback[] = [];

export function setGlobalLoading(value: boolean) {
  subscribers.forEach((cb) => cb(value));
}

export function subscribeGlobalLoading(cb: Callback) {
  subscribers.push(cb);
  return () => {
    subscribers = subscribers.filter((fn) => fn !== cb);
  };
}


export  function LoadingGlobal() {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
      <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 1301,
          }}
      >
        <LinearProgress color="secondary" />
      </div>
  );
}


export default function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return subscribeGlobalLoading(setLoading);
  }, []);

  return (
      <LoadingContext.Provider value={{ loading }}>
        {children}
      </LoadingContext.Provider>
  );
}