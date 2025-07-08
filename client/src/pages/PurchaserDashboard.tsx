import { Typography, Box, Button } from "@mui/material";
import DashboardLayout from "../components/layouts/DashboardLayout";

export default function PurchaserDashboard() {
  return (
    <DashboardLayout>
      <Typography variant="h5" align="center" gutterBottom>
        購入者ダッシュボード
      </Typography>
      <Box mt={2} display="flex" flexDirection="column" alignItems="center">
        <Typography>ここに商品検索や注文機能を実装します。</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          商品を検索する
        </Button>
      </Box>
    </DashboardLayout>
  );
}
