import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  TextField,
  Alert,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

export default function Login() {
  const [role, setRole] = useState<UserRole>("purchaser");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setRole: setAuthRole } = useAuth();

  const apiUrl = import.meta.env.VITE_API_URL as string;

  // パスワードが必要なロールかどうかチェック
  const requiresPassword = ["ordertaker", "accountant", "shipping"].includes(
    role
  );

  const handleLogin = async () => {
    if (!apiUrl) {
      console.warn(
        "VITE_API_URLが設定されていません。client/.envファイルにVITE_API_URLを定義し、Viteサーバーを再起動してください。"
      );
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 購入者の場合はパスワード認証不要
      if (role === "purchaser") {
        setAuthRole(role);
        return;
      }

      // パスワードが必要なロールの場合は認証API呼び出し
      if (requiresPassword) {
        const response = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
            password,
          }),
        });

        const data = await response.json();

        if (data.status === "success") {
          setAuthRole(role);
        } else {
          setError(data.message || "認証に失敗しました。");
        }
      }
    } catch (err) {
      setError("サーバーエラーが発生しました。しばらく後でお試しください。");
      console.error("ログインエラー:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 8,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          ログイン
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={3}>
          <FormControl fullWidth>
            <InputLabel id="role-label">ロール</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              label="ロール"
              onChange={(e) => {
                setRole(e.target.value as UserRole);
                setPassword(""); // ロール変更時にパスワードをクリア
                setError(""); // エラーもクリア
              }}
            >
              <MenuItem value="purchaser">購入者</MenuItem>
              <MenuItem value="ordertaker">注文受付係</MenuItem>
              <MenuItem value="accountant">会計係</MenuItem>
              <MenuItem value="shipping">発送係</MenuItem>
            </Select>
          </FormControl>

          {requiresPassword && (
            <TextField
              fullWidth
              type="password"
              label="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力してください"
              required
            />
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleLogin}
            disabled={loading || (requiresPassword && !password)}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </Button>

          {!requiresPassword && (
            <Typography variant="body2" color="text.secondary" align="center">
              購入者としてログインします（パスワード不要）
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
