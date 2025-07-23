import { Alert, Snackbar } from "@mui/material";
import type { NotificationState } from "../../hooks/useNotification";

type Props = {
  notification: NotificationState;
  onClose: () => void;
};

/**
 * 通知コンポーネント
 */
export default function NotificationComponent({
  notification,
  onClose,
}: Props) {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={notification.severity}
        sx={{ width: "100%" }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
}
