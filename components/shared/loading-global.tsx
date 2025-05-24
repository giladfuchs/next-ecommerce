"use client";
import { LinearProgress } from "@mui/material";
import { useLoading } from "lib/provider/LoadingProvider";

export default function LoadingGlobal() {
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
