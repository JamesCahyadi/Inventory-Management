import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import InputIcon from '@material-ui/icons/Input';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { Alert } from '@material-ui/lab';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    TextField,
    Collapse,
    IconButton
} from '@material-ui/core';

const useStyles = makeStyles({
    table: {
        minWidth: 650,
    }
});


const OrderItemsTable = ({ match }) => {
    const classes = useStyles();
    const orderId = match.params.id;
    const [orderItems, setOrderItems] = useState([]);
    const [showAlert, setShowAlert] = useState(false);

    const getOrderItems = async () => {
        try {
            const response = await fetch(`http://localhost:5000/orders/${orderId}`);
            const orderItems = await response.json();
            setOrderItems(orderItems);
        } catch (error) {
            console.log(error.message);
        }
    }

    const updateQtyReceived = async (itemId, qtyReceived, qtyOrdered) => {
        // check that qtyReceived is a number
        if (!(/^\d+$/).test(qtyReceived)) {
            setShowAlert(true);
            return;
        }

        for (const orderItem of orderItems) {
            if (orderItem.item_id === itemId) {
                // orderItem.qty_received = parseInt(qtyReceived);
                try {
                    const body = { qtyReceived, itemId };
                    const response = await fetch(`http://localhost:5000/orders/${orderId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }

    const receiveAll = async () => {
        try {
            const response = await fetch(`http://localhost:5000/orders/receive/${orderId}`, {
                method: 'PUT'
            });
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getOrderItems();
    }, []);
    // get text input field for qty received, placeholder is current qty received
    return (
        <>
            <Collapse in={showAlert}>
                <Alert
                    severity='warning'
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setShowAlert(false);
                            }}
                        >
                            <HighlightOffIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    All Qty Received values must be a number from 0 - Qty Ordered value!
                </Alert>
            </Collapse>
            <Button
                variant="contained"
                color="secondary"
                endIcon={<InputIcon />}
                onClick={() => receiveAll()}
                component={Link}
                to='/orders'
            >
                Receive All
            </Button>
            <TableContainer component={Paper}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow selected>
                            <TableCell>Item Description</TableCell>
                            <TableCell>Item Price</TableCell>
                            <TableCell>Qty Received</TableCell>
                            <TableCell>Qty Ordered</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orderItems.map((orderItem) => (
                            <TableRow hover key={orderItem.item_id}>
                                <TableCell>
                                    {orderItem.description}
                                </TableCell>
                                <TableCell>
                                    {orderItem.price}
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        placeholder={orderItem.qty_received.toString()}
                                        onBlur={e => updateQtyReceived(orderItem.item_id, e.target.value, orderItem.qty_ordered)}
                                        InputProps={{
                                            inputProps: {
                                                min: orderItem.qty_received,
                                                max: orderItem.qty_ordered
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {orderItem.qty_ordered}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default OrderItemsTable;