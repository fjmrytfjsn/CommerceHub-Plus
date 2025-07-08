import { Typography, Box, Button } from "@mui/material";
import DashboardLayout from "../components/layouts/DashboardLayout";

export default function ShippingDashboard() {
  return (
    <DashboardLayout>
      <Typography variant="h5" align="center" gutterBottom>
        発送係ダッシュボード
      </Typography>
      <Box mt={2} display="flex" flexDirection="column" alignItems="center">
        <Typography>
          ここに未発送注文の管理や発送処理機能を実装します。
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          未発送注文を表示
        </Button>
      </Box>
    </DashboardLayout>
  );
}
