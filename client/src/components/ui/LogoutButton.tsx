import { Box, Button } from "@mui/material";

type Props = {
  onLogout: () => void;
};

/**
 * ログアウトボタンコンポーネント
 * 右上に配置されるログアウトボタン
 */
export default function LogoutButton({ onLogout }: Props) {
  return (
    <Box display="flex" justifyContent="flex-end" mb={2}>
      <Button variant="outlined" color="secondary" onClick={onLogout}>
        ログアウト
      </Button>
    </Box>
  );
}
