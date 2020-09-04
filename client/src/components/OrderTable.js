import React, { useState, useEffect } from 'react';
import CustomTable from './subcomponents/CustomTable';
import CustomAlert from './subcomponents/CustomAlert';
import CustomModal from './subcomponents/CustomModal';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { TableCell, TableRow, Typography, TextField, InputAdornment, Box, FormControlLabel, Checkbox, Button } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';


const useStyles = makeStyles({
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
    const [searchValue, setSearchValue] = useState('');
    const [checkedOrders, setCheckedOrders] = useState([]);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const headers = ['Order Ref Number', 'Qty Received', 'Qty Ordered', 'Total Items', 'Order Value', 'Status'];

    const getOrders = async (order = '') => {
        try {
            let response;
            if (!order) {
                response = await fetch(`/orders`);
            } else {
                response = await fetch(`/orders/?ref=${order}`)
            }
            const orders = await response.json();
            setOrders(orders);
        } catch (error) {
            console.log(error.message);
        }
    }

    const lookup = (order) => {
        setSearchValue(order);
        if (order) {
            getOrders(order);
        } else {
            getOrders();
        }
    }

    const changeCheckedOrders = (id) => {
        if (checkedOrders.includes(id)) {
            const index = checkedOrders.indexOf(id);
            const checkedOrdersCopy = checkedOrders.slice();
            checkedOrdersCopy.splice(index, 1);
            setCheckedOrders(checkedOrdersCopy);
        } else {
            setCheckedOrders([...checkedOrders, id]);
        }
    }

    const deleteOrders = async () => {
        try {
            const body = { checkedOrders };
            setCheckedOrders([]);
            setShowDeleteModal(false);
            await fetch(`/orders`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            getOrders();
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        getOrders();
    }, []);

    return (
        <>
            <CustomAlert
                open={showDeleteAlert}
                close={() => setShowDeleteAlert(false)}
                description=' You must select at least one order to delete!'
            />
            <CustomModal
                open={showDeleteModal}
                close={() => setShowDeleteModal(false)}
                body={
                    <>
                        <Typography variant='h5' align='center' gutterBottom>
                            <b>Delete Item Confirmation</b>
                        </Typography>
                        <Typography align='center' paragraph>
                            You are about to <b>delete</b> {checkedOrders.length} orders!
                            This will reduce your qty on hand and qty on order
                            amounts for the items in these orders.
                            This action cannot be undone.
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            endIcon={<CheckCircleIcon />}
                            onClick={() => deleteOrders()}
                        >
                            Confirm
                        </Button>
                    </>
                }
            />
            <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Box margin={1}>
                    <TextField
                        label="Search for an order"
                        value={searchValue}
                        onChange={e => lookup(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                <Box margin={1}>
                    <Button
                        variant="contained"
                        color="secondary"
                        endIcon={<DeleteIcon />}
                        onClick={() => checkedOrders.length > 0 ? (setShowDeleteAlert(false), setShowDeleteModal(true)) : setShowDeleteAlert(true)}
                    >
                        Delete Orders
                    </Button>
                </Box>
            </Box>
            <CustomTable
                headers={headers}
                body=
                {orders.map((order) => (
                    <TableRow hover key={order.order_id}>
                        <TableCell>
                            <FormControlLabel
                                control=
                                {
                                    <Checkbox
                                        value={order.order_id}
                                        onChange={e => changeCheckedOrders(e.target.value)}
                                    />
                                }
                            />
                            <Link to={{ pathname: `/orders/${order.order_id}` }}>
                                {order.ref_number}
                            </Link>
                        </TableCell>
                        <TableCell>{order.qty_received}</TableCell>
                        <TableCell>{order.qty_ordered}</TableCell>
                        <TableCell>{order.total_items}</TableCell>
                        <TableCell>${order.order_value}</TableCell>
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
            />
        </>
    );
}

export default OrderTable;