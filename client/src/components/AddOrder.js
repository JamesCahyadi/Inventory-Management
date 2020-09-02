import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { makeStyles } from '@material-ui/core/styles';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Button,
    Collapse,
    IconButton,
    Modal,
    Typography
} from '@material-ui/core';


const useStyles = makeStyles(theme => ({
    table: {
        minWidth: 650,
    },
    hidden: {
        display: 'none'
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalPaper: {
        position: 'absolute',
        maxWidth: 300,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: 10
    },
    rightAlign: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginRight: 2
    },
    centerAlign: {
        display: 'flex',
        justifyContent: 'center'
    }
}));

const AddOrder = ({ location }) => {
    const classes = useStyles();
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
            setShowAlert(true);
            return;
        }

        // check the qtyOrdereds are all non zero integers
        if (!(/^\d+$/).test(Object.keys(qtyOrdered))) {
            setShowAlert(true);
            return;
        }

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
            window.location.href = '/orders';
            const response = await fetch('http://localhost:5000/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            //.then(history.push('/orders'));
        } catch (error) {
            console.log(error.message);
        }
    }


    const getOrderItems = async () => {
        try {
            for (let i = 0; i < orderItemIds.length; ++i) {
                const response = await fetch(`http://localhost:5000/items/${orderItemIds[i]}`);
                const orderItem = await response.json();
                setOrderItems(prevOrderItems => [...prevOrderItems, orderItem]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getOrders = async () => {
        try {
            const response = await fetch(`http://localhost:5000/orders`);
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
                    Please fill in the Qty Ordered column for <b>all</b> items with non-zero integers!
                </Alert>
            </Collapse>
            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                // onBackdropClick='false'
                className={classes.modal}
            >
                <div className={classes.modalPaper}>
                    <div className={classes.rightAlign}>
                        <IconButton
                            size='small'
                            color="inherit"
                            onClick={() => setShowModal(false)}
                        >
                            <HighlightOffIcon fontSize="inherit" />
                        </IconButton>
                    </div>
                    <Typography variant='h5' align='center' gutterBottom>
                        <b>Duplicate Order Warning!</b>
                    </Typography>
                    <Typography align='center' paragraph>
                        This order ref number <b>already exists</b>.
                        The items and order quantities will be <b>merged</b> into the existing order.
                    </Typography>
                    <div className={classes.centerAlign}>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<CheckCircleIcon />}
                            onClick={() => addOrder()}
                        >
                            Confirm
                    </Button>
                    </div>
                </div>
            </Modal>
            <TextField
                required
                label="Order Name"
                onChange={e => setRefNumber(e.target.value)}
                error={orderErr}
                helperText={orderHelperText}
            />
            <Button
                variant="contained"
                color="secondary"
                endIcon={<AddCircleIcon />}
                onClick={() => validateOrder()}
            >
                Submit Order
            </Button>
            <TableContainer component={Paper}>
                <Table className={classes.table} size="small">
                    <TableHead>
                        <TableRow selected>
                            <TableCell>Item</TableCell>
                            <TableCell>Unit Price</TableCell>
                            <TableCell>Qty Ordered</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
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
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default AddOrder;