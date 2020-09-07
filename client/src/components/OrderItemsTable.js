import React, { useState, useEffect } from 'react';
import CustomTable from './subcomponents/CustomTable';
import CustomAlert from './subcomponents/CustomAlert';
import CustomButton from './subcomponents/CustomButton';
import { Link, useHistory } from 'react-router-dom';
import { TableCell, TableRow, TextField, Box } from '@material-ui/core';
import InputIcon from '@material-ui/icons/Input';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const OrderItemsTable = ({ match }) => {
    const orderId = match.params.id;
    const [orderItems, setOrderItems] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [initialRefNumber, setInitialRefNumber] = useState('');
    const [refNumber, setRefNumber] = useState('');
    const [refNumberErr, setRefNumberErr] = useState(false);
    const [refNumberHelperText, setRefNumberHelperText] = useState('');
    const [orders, setOrders] = useState([]);
    const history = useHistory();
    const headers = ['Item', 'Unit Price', 'Qty Received', 'Qty Ordered'];

    const getOrderItems = async () => {
        try {
            const response = await fetch(`/orders/${orderId}`);
            const orderItems = await response.json();
            setOrderItems(orderItems);
            setInitialRefNumber(orderItems[0].ref_number);
            setRefNumber(orderItems[0].ref_number);
        } catch (error) {
            console.log(error.message);
        }
    }

    const updateQtyReceived = async (itemId, qtyReceived) => {
        // check that qtyReceived is a number
        if (!(/^\d+$/).test(qtyReceived)) {
            setShowAlert(true);
            return;
        }

        for (const orderItem of orderItems) {
            if (orderItem.item_id === itemId) {
                try {
                    const body = { qtyReceived, itemId };
                    await fetch(`/orders/item/${orderId}`, {
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
            await fetch(`/orders/receive/${orderId}`, {
                method: 'PUT'
            });
        } catch (error) {
            console.log(error);
        }
    }

    const validateRefNumber = () => {
        if (!refNumber) {
            setRefNumberErr(true);
            setRefNumberHelperText('Required Field');
            return;
        }
        if (!(/^[a-zA-Z\s\d]*$/).test(refNumber)) {
            setRefNumberErr(true);
            setRefNumberHelperText('Only letters and numbers allowed');
            return;
        }

        for (let order of orders) {
            if (refNumber !== initialRefNumber && order.ref_number === refNumber) {
                setRefNumberErr(true);
                setRefNumberHelperText('Order already exists');
                return;
            }
        }

        setRefNumberErr(false);
        setRefNumberHelperText('');
        updateRefNumber();
    }

    const updateRefNumber = async () => {
        try {
            const body = { refNumber };
            await fetch(`/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            history.push('/orders');
        } catch (error) {
            console.log(error.message);
        }
    }

    const getOrders = async () => {
        try {
            const response = await fetch(`/orders`);
            const allOrders = await response.json();
            setOrders(allOrders);
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        getOrderItems();
        getOrders();
    }, []);

    return (
        <>
            <CustomAlert
                open={showAlert}
                close={() => setShowAlert(false)}
                description='All Qty Received values must be a number between 0 and the Qty Ordered value!'
            />
            <Box display='flex' alignItems='center'>
                <Box margin={1}>
                    <TextField
                        required
                        label="Order Ref Number"
                        placeholder={initialRefNumber}
                        value={refNumber || ''}
                        onChange={e => setRefNumber(e.target.value)}
                        error={refNumberErr}
                        helperText={refNumberHelperText}
                    />
                </Box>
                <Box margin={1}>
                    <CustomButton
                        label='Save'
                        icon={<CheckCircleIcon />}
                        click={() => validateRefNumber()}
                    />
                </Box>
                <Box margin={1}>
                    <CustomButton
                        label='Receive All'
                        icon={<InputIcon />}
                        click={() => receiveAll()}
                        type={Link}
                        link='/orders'
                    />
                </Box>
            </Box>
            <CustomTable
                headers={headers}
                body={orderItems.map((orderItem) => (
                    <TableRow hover key={orderItem.item_id}>
                        <TableCell>
                            <Link to={{ pathname: `/item/${orderItem.item_id}` }}>
                                {orderItem.description}
                            </Link>
                        </TableCell>
                        <TableCell>
                            ${orderItem.price}
                        </TableCell>
                        <TableCell>
                            <TextField
                                type="number"
                                placeholder={orderItem.qty_received.toString()}
                                onBlur={e => updateQtyReceived(orderItem.item_id, e.target.value)}
                                InputProps={{
                                    inputProps: {
                                        min: 0,
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
            />
        </>
    );
}

export default OrderItemsTable;