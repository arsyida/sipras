"use client";

import { Fragment } from "react";
import {Card , CardContent, CardHeader, List, ListItem, ListItemText, Typography, Divider} from "@mui/material";

const LowStockList = ({ items }) => (
    <Card variant="outlined" sx={{p:1}}>
        <CardHeader title="Stok Persediaan Menipis" />
        <CardContent sx={{ pt: 0 }}>
            <List disablePadding>
                {items.map((item, index) => (
                    <Fragment key={index}>
                        <ListItem disablePadding sx={{ py: 1 }}>
                            <ListItemText primary={item.name} />
                            <Typography variant="body1" color="text.secondary">{item.quantity} Barang</Typography>
                        </ListItem>
                        {index < items.length - 1 && <Divider component="li" />}
                    </Fragment>
                ))}
            </List>
        </CardContent>
    </Card>
);

export default LowStockList;