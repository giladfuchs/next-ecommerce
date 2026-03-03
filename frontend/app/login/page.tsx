"use client";
import { Box, Button, TextField, Typography, Container } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import { toast } from "sonner";

import { loginUser, registerUser, resetMockDb } from "@/lib/api";
import { SEVEN_DAYS } from "@/lib/config/config";

export default function LoginPage() {
  const router = useRouter();
  const intl = useIntl();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (isRegister) {
        await registerUser({ username, password, email });
        toast.success("✅ " + intl.formatMessage({ id: "register.success" }), {
          description: intl.formatMessage({ id: "register.login_now" }),
        });
        setIsRegister(false);
        return;
      }

      const { token } = await loginUser(username, password);
      const expiresAt = Date.now() + SEVEN_DAYS;
      localStorage.setItem("token", token);
      localStorage.setItem("token_expires_at", expiresAt.toString());

      toast.success("✅ " + intl.formatMessage({ id: "login.success" }), {
        description: intl.formatMessage({ id: "login.redirect" }),
      });

      router.push("/admin");
    } catch (err: unknown) {
      const message = (err instanceof Error && err.message) || "";

      toast.error(
        intl.formatMessage({
          id: isRegister ? "register.failed" : "login.error",
        }),
        { description: message },
      );
    }
  }
  const handleResetMockDb = async () => {
    try {
      await resetMockDb();
      toast.success(intl.formatMessage({ id: "reset_mock_db.success" }));
    } catch (err: unknown) {
      const message = (err instanceof Error && err.message) || "";

      toast.error(intl.formatMessage({ id: "reset_mock_db.disabled" }), {
        description: message,
      });
    }
  };

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
          <FormattedMessage
            id={isRegister ? "register.title" : "login.title"}
          />
        </Typography>

        <TextField
          label={intl.formatMessage({ id: "login.username" })}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {isRegister && (
          <TextField
            label={intl.formatMessage({ id: "register.email" })}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
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
          color={isRegister ? "secondary" : "primary"}
          fullWidth
          data-testid="admin-login-button"
        >
          <FormattedMessage
            id={isRegister ? "register.button" : "login.button"}
          />
        </Button>
        <Button
          variant="text"
          color={isRegister ? "primary" : "secondary"}
          onClick={() => setIsRegister(!isRegister)}
        >
          <FormattedMessage
            id={!isRegister ? "register.toggle" : "login.toggle"}
          />
        </Button>
        <Button color="warning" onClick={handleResetMockDb}>
          <FormattedMessage id="reset_mock_db.button" />
        </Button>
      </Box>
    </Container>
  );
}
