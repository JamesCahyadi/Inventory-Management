import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography
} from '@material-ui/core';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
    green: {
        color: '#3cb371'
    },
    red: {
        color: 'red'
    }
});


const OrderTable = () => {
    const classes = useStyles();
    const [orders, setOrders] = useState([]);

    const getOrders = async () => {
        try {
            const response = await fetch(`/orders`);
            const orders = await response.json();
            setOrders(orders);
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        getOrders();
    }, []);

    return (
        <>
            <TableContainer component={Paper}>
                <Table className={classes.table} size="small">
                    <TableHead>
                        <TableRow selected>
                            <TableCell>Order Ref Number</TableCell>
                            <TableCell>Qty Received</TableCell>
                            <TableCell>Qty Ordered</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow hover key={order.ref_number}>
                                <TableCell>
                                    <Link to={{
                                        pathname: `/orders/${order.order_id}`
                                    }}
                                    >
                                        {order.ref_number}
                                    </Link>
                                </TableCell>
                                <TableCell>{order.qty_received}</TableCell>
                                <TableCell>{order.qty_ordered}</TableCell>
                                <TableCell>
                                    <Typography
                                        className={order.qty_received === order.qty_ordered ? classes.green : classes.red}
                                        variant='inherit'
                                    >
                                        {order.qty_received === order.qty_ordered ? 'Complete' : 'Incomplete'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer >
        </>
    );
}

export default OrderTable;