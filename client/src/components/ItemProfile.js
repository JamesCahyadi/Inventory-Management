import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TextField,
    Button
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


const ItemProfile = ({ match }) => {
    const classes = useStyles();
    //mjust make an edit on the item table, much easier
    // reget the items
    const itemId = match.params.id;
    const [items, setItems] = useState([]);
    const [itemBreakdown, setItemBreakdown] = useState([]);
    const [initialDescription, setInitialDescription] = useState();
    const [description, setDescription] = useState();
    const [descriptionErr, setDescriptionErr] = useState(false);
    const [descriptionHelperText, setDescriptionHelperText] = useState('');
    const [price, setPrice] = useState();
    const [priceErr, setPriceErr] = useState(false);
    const [priceHelpertext, setPriceHelperText] = useState('');

    const getItems = async () => {
        try {
            const response = await fetch(`http://localhost:5000/items`);
            const items = await response.json();
            setItems(items);
        } catch (error) {
            console.log(error.message);
        }
    }

    const getItem = async () => {
        try {
            const response = await fetch(`http://localhost:5000/items/${itemId}`);
            const item = await response.json();
            setDescription(item.description);
            setInitialDescription(item.description);
            setPrice(item.price);
        } catch (error) {
            console.log(error.message);
        }
    }

    const getItemBreakdown = async () => {
        try {
            const response = await fetch(`http://localhost:5000/items-breakdown/${itemId}`);
            const orders = await response.json();
            setItemBreakdown(orders);
        } catch (error) {
            console.log(error.message);
        }
    }

    const validateDescription = () => {
        if (!description) {
            setDescriptionErr(true);
            setDescriptionHelperText('Required field');
            return;
        }

        if (!(description.length > 0) && !(description.length <= 50)) {
            setDescriptionErr(true);
            setDescriptionHelperText('Must be 1-50 characters long');
            return;
        }

        if (!(/^[a-zA-Z\s]*$/).test(description)) {
            setDescriptionErr(true);
            setDescriptionHelperText('Special characters are not allowed');
            return;
        }

        for (let item of items) {
            if (description != initialDescription && item.description === description) {
                setDescriptionErr(true);
                setDescriptionHelperText('Item already exists');
                return;
            }
        }
        setDescriptionErr(false);
        setDescriptionHelperText('');
        validatePrice();
    }

    const validatePrice = () => {
        if (!price) {
            setPriceErr(true);
            setPriceHelperText('Required field');
            return;
        }
        if (!(/^(\d+(\.\d{1,2})?)$/).test(price)) {
            setPriceErr(true);
            setPriceHelperText('Not a valid price format');
            return;
        }

        setPriceErr(false);
        setPriceHelperText('');
        updateItem();
    }

    const updateItem = async () => {
        try {
            const body = { description, price };
            const response = await fetch(`http://localhost:5000/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        getItemBreakdown();
        getItems();
        getItem();
    }, []);

    return (
        <>
            <TextField
                required
                label="Item Name"
                placeholder={initialDescription}
                value={description || ''}
                onChange={e => setDescription(e.target.value)}
                error={descriptionErr}
                helperText={descriptionHelperText}
            />
            <TextField
                required
                label="Price"
                value={price || ''}
                onChange={e => setPrice(e.target.value)}
                error={priceErr}
                helperText={priceHelpertext}
            />
            <Button
                variant="contained"
                color="secondary"
                endIcon={<CheckCircleIcon />}
                onClick={() => validateDescription()}
            >
                Save
            </Button>
            <Typography>
                Item Breakdown
            </Typography>

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
                        {itemBreakdown.map((order) => (
                            <TableRow hover key={order.order_id}>
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

export default ItemProfile;

