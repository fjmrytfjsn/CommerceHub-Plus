import { Container, Paper } from "@mui/material";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

export default function DashboardLayout({ children, maxWidth = "md" }: Props) {
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
      <Paper elevation={2} sx={{ p: 4, width: "100%", maxWidth: 600 }}>
        {children}
      </Paper>
    </Container>
  );
}
