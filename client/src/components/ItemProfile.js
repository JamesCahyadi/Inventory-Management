import React, { useState, useEffect } from 'react';
import CustomTable from './subcomponents/CustomTable';
import CustomButton from './subcomponents/CustomButton';
import { Link, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { TableCell, TableRow, Typography, TextField, Box } from '@material-ui/core';

const useStyles = makeStyles({
    green: {
        color: '#3cb371'
    },
    red: {
        color: 'red'
    }
});

const ItemProfile = ({ match }) => {
    const classes = useStyles();
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
    let history = useHistory();
    const headers = ['Item In Orders:', 'Item Qty Received', 'Item Qty Ordered', 'Item Status'];

    const getItems = async () => {
        try {
            const response = await fetch(`/items`);
            const items = await response.json();
            setItems(items);
        } catch (error) {
            console.log(error.message);
        }
    }

    const getItem = async () => {
        try {
            const response = await fetch(`/items/${itemId}`);
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
            const response = await fetch(`/items/breakdown/${itemId}`);
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
            if (description !== initialDescription && item.description === description) {
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
            await fetch(`/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            history.push('/items');
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
            <Box display='flex' alignItems='center'>
                <Box margin={1}>
                    <TextField
                        required
                        label="Item Name"
                        placeholder={initialDescription}
                        value={description || ''}
                        onChange={e => setDescription(e.target.value)}
                        error={descriptionErr}
                        helperText={descriptionHelperText}
                    />
                </Box>
                <Box margin={1}>
                    <TextField
                        required
                        label="Price"
                        value={price || ''}
                        onChange={e => setPrice(e.target.value)}
                        error={priceErr}
                        helperText={priceHelpertext}
                    />
                </Box>
                <Box margin={1}>
                    <CustomButton
                        label='Save'
                        icon={<CheckCircleIcon />}
                        click={() => validateDescription()}
                    />
                </Box>
            </Box>
            <CustomTable
                headers={headers}
                body=
                {itemBreakdown.map((order) => (
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
            />
        </>
    );
}

export default ItemProfile;

