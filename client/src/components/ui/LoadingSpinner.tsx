import { CircularProgress, Box } from "@mui/material";

type Props = {
  size?: number;
  message?: string;
};

/**
 * ローディングスピナーコンポーネント
 */
export default function LoadingSpinner({ size = 40, message }: Props) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" py={4}>
      <CircularProgress size={size} />
      {message && (
        <Box mt={2} color="text.secondary">
          {message}
        </Box>
      )}
    </Box>
  );
}
