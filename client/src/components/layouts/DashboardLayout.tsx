import { Container, Paper } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

/**
 * MUIのデフォルトブレークポイント（xs, sm, md, lg, xl）ごとに
 * PaperのpaddingとmaxWidthを細かく設定したレイアウト
 */
export default function DashboardLayout({ children, maxWidth = "xl" }: Props) {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        mt: 6,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          // 各ブレークポイントごとにpaddingとmaxWidthを設定
          p: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
          width: "100%",
          maxWidth: {
            xs: "100%",
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1400,
          },
        }}
      >
        {children}
      </Paper>
    </Container>
  );
}
