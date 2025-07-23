import {
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DashboardLayout from "../components/layouts/DashboardLayout";
import LogoutButton from "../components/ui/LogoutButton";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import NotificationComponent from "../components/ui/NotificationComponent";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useOrders } from "../hooks/useOrders";
import { useNotification } from "../hooks/useNotification";
import CheckIcon from "@mui/icons-material/Check";

/**
 * 発送係ダッシュボード
 */
export default function ShippingDashboard() {
  const { logout } = useAuth();
  const { orders, loading, searchOrders, updateShippingStatus } = useOrders();
  const { notification, showNotification, hideNotification } =
    useNotification();

  // 検索条件
  const [searchParams, setSearchParams] = useState({
    orderNo: "",
    orderDate: "",
    purchaserName: "",
    paymentStatus: "支払済",
    shippingStatus: "未発送",
  });

  // 初回マウント時に「支払済、未発送」で自動絞り込み
  useEffect(() => {
    searchOrders({ paymentStatus: "支払済", shippingStatus: "未発送" });
  }, [searchOrders]);

  // 検索パラメータの更新
  const updateSearchParam = (field: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [field]: value }));
  };

  // 注文検索
  const handleSearch = async () => {
    await searchOrders(searchParams);
  };

  // 発送状態更新
  const handleUpdateShipping = async (orderNo: string) => {
    const success = await updateShippingStatus(orderNo, "発送済");
    if (success) {
      showNotification("発送状態を更新しました。", "success");
    } else {
      showNotification("発送状態の更新に失敗しました。", "error");
    }
  };

  return (
    <DashboardLayout>
      <LogoutButton onLogout={logout} />
      <Typography variant="h5" align="center" gutterBottom>
        発送係ダッシュボード
      </Typography>

      {/* 検索フォームセクション */}
      <Box
        mt={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
      >
        <Box
          display="flex"
          alignItems="center"
          mb={1}
          gap={2}
          width="100%"
          maxWidth={{ xs: "100%", md: 1200 }}
        >
          <Typography mb={2} align="left">
            注文検索・発送管理
          </Typography>
        </Box>
        <Box
          display="flex"
          gap={2}
          mb={2}
          width="100%"
          maxWidth={{ xs: "100%", md: 1200 }}
          mx="auto"
        >
          <TextField
            label="注文番号"
            value={searchParams.orderNo}
            onChange={(e) => updateSearchParam("orderNo", e.target.value)}
            size="small"
            fullWidth
            sx={{ flex: 1 }}
          />
          <TextField
            label="注文日"
            value={searchParams.orderDate}
            onChange={(e) => updateSearchParam("orderDate", e.target.value)}
            size="small"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ flex: 1 }}
          />
          <TextField
            label="購入者氏名"
            value={searchParams.purchaserName}
            onChange={(e) => updateSearchParam("purchaserName", e.target.value)}
            size="small"
            fullWidth
            sx={{ flex: 1 }}
          />
          <FormControl size="small" fullWidth sx={{ flex: 1, minWidth: 120 }}>
            <InputLabel id="payment-status-label">支払い状態</InputLabel>
            <Select
              labelId="payment-status-label"
              value={searchParams.paymentStatus}
              label="支払い状態"
              onChange={(e) => {
                const value = e.target.value;
                updateSearchParam(
                  "paymentStatus",
                  searchParams.paymentStatus === value ? "" : value
                );
              }}
              renderValue={(selected) => selected || ""}
            >
              {["未払い", "支払済"].map((status) => (
                <MenuItem
                  key={status}
                  value={status}
                  onClick={() => {
                    updateSearchParam(
                      "paymentStatus",
                      searchParams.paymentStatus === status ? "" : status
                    );
                  }}
                >
                  {status}
                  {searchParams.paymentStatus === status && (
                    <CheckIcon
                      fontSize="small"
                      sx={{ ml: 1, verticalAlign: "middle" }}
                    />
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth sx={{ flex: 1, minWidth: 120 }}>
            <InputLabel id="shipping-status-label">発送状態</InputLabel>
            <Select
              labelId="shipping-status-label"
              value={searchParams.shippingStatus}
              label="発送状態"
              onChange={(e) => {
                const value = e.target.value;
                updateSearchParam(
                  "shippingStatus",
                  searchParams.shippingStatus === value ? "" : value
                );
              }}
              renderValue={(selected) => selected || ""}
            >
              {["未発送", "発送済"].map((status) => (
                <MenuItem
                  key={status}
                  value={status}
                  onClick={() => {
                    updateSearchParam(
                      "shippingStatus",
                      searchParams.shippingStatus === status ? "" : status
                    );
                  }}
                >
                  {status}
                  {searchParams.shippingStatus === status && (
                    <CheckIcon
                      fontSize="small"
                      sx={{ ml: 1, verticalAlign: "middle" }}
                    />
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
            sx={{ minWidth: 100, flexShrink: 0 }}
          >
            検索
          </Button>
        </Box>

        {/* 検索結果テーブル */}
        {loading ? (
          <LoadingSpinner message="検索中..." />
        ) : (
          <Box width="100%" maxWidth={{ xs: "100%", md: 1200 }} mx="auto">
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>注文番号</TableCell>
                    <TableCell>注文日</TableCell>
                    <TableCell>購入者名</TableCell>
                    <TableCell>支払い状態</TableCell>
                    <TableCell>発送状態</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderNo}>
                      <TableCell>{order.orderNo}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>{order.purchaserName}</TableCell>
                      <TableCell>{order.paymentStatus}</TableCell>
                      <TableCell>{order.shippingStatus}</TableCell>
                      <TableCell>
                        {order.shippingStatus === "未発送" &&
                          order.paymentStatus === "支払済" && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleUpdateShipping(order.orderNo)
                              }
                            >
                              発送完了
                            </Button>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        検索結果がありません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      <NotificationComponent
        notification={notification}
        onClose={hideNotification}
      />
    </DashboardLayout>
  );
}
