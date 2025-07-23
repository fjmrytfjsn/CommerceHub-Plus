import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import DashboardLayout from "../components/layouts/DashboardLayout";
import LogoutButton from "../components/ui/LogoutButton";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import NotificationComponent from "../components/ui/NotificationComponent";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import { useNotification } from "../hooks/useNotification";
import type { PurchaserInfo, PhoneOrderRequest } from "../types";

/**
 * 注文受付係ダッシュボード
 */
export default function OrderTakerDashboard() {
  const { logout } = useAuth();
  const { products, loading: productsLoading, fetchProducts } = useProducts();
  const {
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    getTotalAmount,
  } = useCart();
  const { notification, showNotification, hideNotification } =
    useNotification();

  // フォーム状態
  const [purchaserInfo, setPurchaserInfo] = useState<PurchaserInfo>({
    name: "",
    address: "",
    contact: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("銀行振込");
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL as string;

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 購入者情報の更新
  const updatePurchaserInfo = (field: keyof PurchaserInfo, value: string) => {
    setPurchaserInfo((prev) => ({ ...prev, [field]: value }));
  };

  // 注文確定
  const handleOrder = async () => {
    setLoading(true);

    // バリデーション
    const { name, address, contact } = purchaserInfo;

    if (!name || !address || !contact || cart.length === 0) {
      showNotification("全ての項目を入力してください。", "error");
      setLoading(false);
      return;
    }

    try {
      const productDetails = cart.map((item) => ({
        productNo: item.productNo,
        purchaseQuantity: Number(item.quantity),
      }));

      // 数量のバリデーション
      if (
        !productDetails.every(
          (pd) =>
            typeof pd.purchaseQuantity === "number" &&
            !isNaN(pd.purchaseQuantity) &&
            pd.purchaseQuantity >= 1
        )
      ) {
        showNotification("カート内商品の数量が不正です。", "error");
        setLoading(false);
        return;
      }

      const orderRequest: PhoneOrderRequest = {
        productDetails,
        purchaserInfo,
        paymentMethod,
      };

      const response = await fetch(`${apiUrl}/api/orders/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderRequest),
      });

      const data = await response.json();
      if (data.status === "success") {
        showNotification("注文が完了しました。", "success");
        clearCart();
        fetchProducts();
        // フォームをリセット
        setPurchaserInfo({ name: "", address: "", contact: "" });
        setPaymentMethod("銀行振込");
      } else {
        showNotification(
          data.message ?? "注文処理中にエラーが発生しました。",
          "error"
        );
      }
    } catch {
      showNotification("サーバーエラーが発生しました。", "error");
    }
    setLoading(false);
  };

  if (productsLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="商品データを読み込み中..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <LogoutButton onLogout={logout} />
      <Typography variant="h5" align="center" gutterBottom>
        注文受付係ダッシュボード
      </Typography>

      {/* 商品一覧セクション */}
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
          <Typography align="left" sx={{ flex: 1 }}>
            商品一覧
          </Typography>
          <Button variant="outlined" size="small" onClick={fetchProducts}>
            商品一覧を更新
          </Button>
        </Box>
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: 1200 },
            mx: "auto",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>商品番号</TableCell>
                <TableCell>商品名</TableCell>
                <TableCell>価格</TableCell>
                <TableCell>在庫</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.productNo}>
                  <TableCell>{product.productNo}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.unitPrice}円</TableCell>
                  <TableCell>{product.stockQuantity2}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => addToCart(product)}
                      disabled={product.stockQuantity2 === 0}
                    >
                      カートに追加
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    商品がありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* カート内容セクション */}
        <Box width="100%" maxWidth={{ xs: "100%", md: 1200 }} mt={3} mb={1}>
          <Typography align="left">
            カート内容（合計: {getTotalAmount()}円）
          </Typography>
        </Box>
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", md: 1200 },
            mx: "auto",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>商品番号</TableCell>
                <TableCell>商品名</TableCell>
                <TableCell>数量</TableCell>
                <TableCell>価格</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cart.map((item) => (
                <TableRow key={item.productNo}>
                  <TableCell>{item.productNo}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={item.quantity}
                      inputProps={{
                        min: 1,
                        max: item.stockQuantity2,
                        style: { width: 60 },
                      }}
                      onChange={(e) =>
                        updateCartQuantity(
                          item.productNo,
                          Number(e.target.value)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>{item.unitPrice * item.quantity}円</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => removeFromCart(item.productNo)}
                    >
                      削除
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {cart.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    カートに商品がありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 購入者情報・支払い方法セクション */}
        <Box width="100%" maxWidth={{ xs: "100%", md: 1200 }} mt={3} mb={1}>
          <Typography align="left">購入者情報・支払い方法</Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          width="100%"
          maxWidth={{ xs: "100%", md: 1200 }}
        >
          <TextField
            label="氏名"
            value={purchaserInfo.name}
            onChange={(e) => updatePurchaserInfo("name", e.target.value)}
            size="small"
            required
            fullWidth
          />
          <TextField
            label="住所"
            value={purchaserInfo.address}
            onChange={(e) => updatePurchaserInfo("address", e.target.value)}
            size="small"
            required
            fullWidth
          />
          <TextField
            label="連絡先"
            value={purchaserInfo.contact}
            onChange={(e) => updatePurchaserInfo("contact", e.target.value)}
            size="small"
            required
            fullWidth
          />
          <FormControl size="small" fullWidth>
            <InputLabel id="payment-method-label">支払い方法</InputLabel>
            <Select
              labelId="payment-method-label"
              value={paymentMethod}
              label="支払い方法"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="銀行振込">銀行振込</MenuItem>
              <MenuItem value="コンビニ決済">コンビニ決済</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            disabled={cart.length === 0 || loading}
            onClick={handleOrder}
          >
            注文を確定する
          </Button>
        </Box>
      </Box>

      <NotificationComponent
        notification={notification}
        onClose={hideNotification}
      />
    </DashboardLayout>
  );
}
