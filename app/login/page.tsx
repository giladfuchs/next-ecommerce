"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useIntl, FormattedMessage } from "react-intl";
import { Box, Button, TextField, Typography, Container } from "@mui/material";
import { toast } from "sonner";

import { loginUser } from "../../lib/api";
import { SEVEN_DAYS } from "../../lib/config";

export default function LoginPage() {
  const router = useRouter();
  const intl = useIntl();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/admin");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { token } = await loginUser(username, password);
      const expiresAt = Date.now() + SEVEN_DAYS;
      localStorage.setItem("token", token);
      localStorage.setItem("token_expires_at", expiresAt.toString());

      toast.success("✅ " + intl.formatMessage({ id: "login.success" }), {
        description: intl.formatMessage({ id: "login.redirect" }),
      });

      router.push("/admin");
    } catch (err: any) {
      console.error("❌ Login error:", err);

      toast.error(intl.formatMessage({ id: "login.error" }), {
        description: err.message || intl.formatMessage({ id: "login.failed" }),
      });
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        component="form"
        onSubmit={handleSubmit}
        mt={8}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h4" fontWeight="bold" textAlign="center">
          <FormattedMessage id="login.title" />
        </Typography>

        <TextField
          label={intl.formatMessage({ id: "login.username" })}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          label={intl.formatMessage({ id: "login.password" })}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          data-testid="admin-login-button"
        >
          <FormattedMessage id="login.button" />
        </Button>
      </Box>
    </Container>
  );
}
