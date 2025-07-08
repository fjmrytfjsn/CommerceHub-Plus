import { Typography, Box, Button } from "@mui/material";
import DashboardLayout from "../components/layouts/DashboardLayout";

export default function AccountantDashboard() {
  return (
    <DashboardLayout>
      <Typography variant="h5" align="center" gutterBottom>
        会計係ダッシュボード
      </Typography>
      <Box mt={2} display="flex" flexDirection="column" alignItems="center">
        <Typography>ここに注文検索や入金確認機能を実装します。</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          注文を検索する
        </Button>
      </Box>
    </DashboardLayout>
  );
}
