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
} from "@mui/material";

type Props = {
  onLogin: (role: string) => void;
};

export default function Login({ onLogin }: Props) {
  const [role, setRole] = useState("purchaser");
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
          ログイン（ロール選択）
        </Typography>
        <Box display="flex" flexDirection="column" gap={3}>
          <FormControl fullWidth>
            <InputLabel id="role-label">ロール</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              label="ロール"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="purchaser">購入者</MenuItem>
              <MenuItem value="ordertaker">注文受付係</MenuItem>
              <MenuItem value="accountant">会計係</MenuItem>
              <MenuItem value="shipping">発送係</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => onLogin(role)}
          >
            ログイン
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
