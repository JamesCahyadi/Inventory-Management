import React, { useState, useEffect } from 'react';
import CustomAlert from './subcomponents/CustomAlert';
import CustomTable from './subcomponents/CustomTable';
import CustomModal from './subcomponents/CustomModal';
import { useHistory } from 'react-router-dom';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { TableCell, TableRow, TextField, Button, Typography, Box } from '@material-ui/core';

const AddOrder = ({ location }) => {
    const orderItemIds = location.orderItemIds;
    const [refNumber, setRefNumber] = useState('');
    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [orderErr, setOrderErr] = useState(false);
    const [orderHelperText, setOrderHelperText] = useState('');
    const [qtyOrdered, setQtyOrdered] = useState({});
    const [showAlert, setShowAlert] = useState(false);
    const [showModal, setShowModal] = useState(false);
    let history = useHistory();
    const headers = ['Item', 'Unit Price', 'Qty Ordered'];

    const changeQtyOrdered = (itemId, qty) => {
        setQtyOrdered({ ...qtyOrdered, [itemId]: qty });
    }

    const validateOrder = () => {
        if (!refNumber) {
            setOrderErr(true);
            setOrderHelperText('Required Field');
            return;
        }
        if (!(/^[a-zA-Z\s\d]*$/).test(refNumber)) {
            setOrderErr(true);
            setOrderHelperText('Only letters and numbers allowed');
            return;
        }

        setOrderErr(false);
        setOrderHelperText('');
        validateQty();
    }

    const validateQty = () => {
        // check that qtyOrdered textfields have a value
        if (orderItems.length !== Object.keys(qtyOrdered).length) {
            console.log('first')
            setShowAlert(true);
            return;
        }

        // check the qtys ordered are all non zero integers
        for (let qty of Object.keys(qtyOrdered)) {
            if (!(/^\d+$/).test(qty)) {
                setShowAlert(true);
                return;
            }
        }

        // duplicate order name
        for (let order of orders) {
            if (order.ref_number === refNumber) {
                setShowModal(true);
                return;
            }
        }
        setShowAlert(false);
        addOrder();
    }

    const addOrder = async () => {
        try {
            const body = { refNumber, qtyOrdered, showModal };
            await fetch('/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            history.push('/orders');
        } catch (error) {
            console.log(error.message);
        }
    }

    const getOrderItems = async () => {
        try {
            for (let i = 0; i < orderItemIds.length; ++i) {
                const response = await fetch(`/items/${orderItemIds[i]}`);
                const orderItem = await response.json();
                setOrderItems(prevOrderItems => [...prevOrderItems, orderItem]);
            }
        } catch (error) {
            console.log(error);
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

    // if location.orderItemIds has nothing, redirect to home page
    const checkLocation = () => {
        if (!orderItemIds) {
            history.push('/items');
        }
    }

    useEffect(() => {
        getOrderItems();
        getOrders();
        checkLocation();
    }, []);

    return (
        <>
            <CustomAlert
                open={showAlert}
                close={() => setShowAlert(false)}
                description='Please fill in the Qty Ordered column for all items with non-zero integers!'
            />
            <CustomModal
                open={showModal}
                close={() => setShowModal(false)}
                body={
                    <>
                        <Typography variant='h5' align='center' gutterBottom>
                            <b>Duplicate Order Warning!</b>
                        </Typography>
                        <Typography align='center' paragraph>
                            This order ref number <b>already exists</b>.
                            The items and order quantities will be <b>merged</b> into the existing order.
                        </Typography>
                        <Box display='flex' justifyContent='center'>
                            <Button
                                variant="contained"
                                color="secondary"
                                endIcon={<CheckCircleIcon />}
                                onClick={() => addOrder()}
                            >
                                Confirm
                            </Button>
                        </Box>
                    </>
                }
            />
            <Box display='flex' alignItems='center'>
                <Box margin={1}>
                    <TextField
                        required
                        label="Order Name"
                        onChange={e => setRefNumber(e.target.value)}
                        error={orderErr}
                        helperText={orderHelperText}
                    />
                </Box>
                <Box margin={1}>
                    <Button
                        variant="contained"
                        color="secondary"
                        endIcon={<AddCircleIcon />}
                        onClick={() => validateOrder()}
                    >
                        Submit Order
                    </Button>
                </Box>
            </Box>
            <CustomTable
                headers={headers}
                body=
                {orderItems.map((orderItem) => (
                    <TableRow hover key={orderItem.item_id}>
                        <TableCell>{orderItem.description}</TableCell>
                        <TableCell>${orderItem.price}</TableCell>
                        <TableCell>
                            <TextField
                                required
                                type="number"
                                placeholder='Enter Amount'
                                onChange={e => changeQtyOrdered(orderItem.item_id, e.target.value)}
                                InputProps={{
                                    inputProps: {
                                        min: 1
                                    }
                                }}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            />
        </>
    );
}

export default AddOrder;