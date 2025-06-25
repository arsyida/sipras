"use client";
import { Card, CardContent, Typography } from "@mui/material";

const SummaryCard = ({ title, value, unit }) => (
  <Card variant="outlined" sx={{ width: "50%", height: "100%", p: 1 }}>
    <CardContent>
      <Typography color="text.secondary" gutterBottom sx={{ mb: 2 }}>
        {title}{" "}
      </Typography>
      <Typography variant="h1" component="div" sx={{ fontWeight: "bold" }}>
        {value}{" "}
        <Typography variant="h6" component="span">
          {unit}
        </Typography>
      </Typography>
    </CardContent>
  </Card>
);

export default SummaryCard;
