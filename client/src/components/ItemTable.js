import React, { useState, useEffect } from 'react';
import CustomAlert from './subcomponents/CustomAlert';
import CustomTable from './subcomponents/CustomTable';
import CustomModal from './subcomponents/CustomModal';
import { Link } from 'react-router-dom';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import AddBoxIcon from '@material-ui/icons/AddBox';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {
    TableCell,
    TableRow,
    Button,
    FormControlLabel,
    Checkbox,
    TextField,
    Typography,
    InputAdornment,
    Box
} from '@material-ui/core';

const ItemTable = () => {
    const headers = ['Item', 'Unit Price', 'Qty on Hand', 'Qty on Order'];
    const [items, setItems] = useState([]);
    const [checkedItems, setCheckedItems] = useState([]);
    const [showOrderAlert, setShowOrderAlert] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [description, setDescription] = useState();
    const [descriptionErr, setDescriptionErr] = useState(false);
    const [descriptionHelperText, setDescriptionHelperText] = useState('');
    const [price, setPrice] = useState();
    const [priceErr, setPriceErr] = useState(false);
    const [priceHelpertext, setPriceHelperText] = useState('');
    const [searchValue, setSearchValue] = useState('');


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

        if (!(/^[a-zA-Z\s\d]*$/).test(description)) {
            setDescriptionErr(true);
            setDescriptionHelperText('Special characters are not allowed');
            return;
        }

        for (let item of items) {
            if (item.description === description) {
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
        addItem();
    }


    const getItems = async (item = '') => {
        try {
            let response;
            if (!item) {
                response = await fetch(`/items`);
            } else {
                response = await fetch(`/items/?description=${item}`);
            }
            const items = await response.json();
            setItems(items);
        } catch (error) {
            console.log(error.message);
        }
    }

    const addItem = async () => {
        try {
            const body = { description, price };
            await fetch('/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            setShowNewModal(false);
            getItems();
        } catch (error) {
            console.log(error.message);
        }
    }

    const changeCheckedItems = (id) => {
        // item got unchecked
        if (checkedItems.includes(id)) {
            const index = checkedItems.indexOf(id);
            // make a copy so that we aren't actually altering checkedItems until we setCheckedItems
            const checkedItemsCopy = checkedItems.slice();
            // remove the unchecked item id from array
            checkedItemsCopy.splice(index, 1);
            setCheckedItems(checkedItemsCopy);
            // add the itemId to the checked items list
        } else {
            setCheckedItems([...checkedItems, id]);
        }
    }

    const deleteItems = async () => {
        try {
            const body = { checkedItems };
            // reset the checked items array
            setCheckedItems([]);
            // close modal
            setShowDeleteModal(false);
            await fetch('/items', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            getItems();
        } catch (error) {
            console.log(error.message);
        }
    }

    const lookup = (item) => {
        setSearchValue(item);
        if (item) {
            getItems(item);
        } else {
            getItems();
        }
    }

    useEffect(() => {
        getItems();
    }, []);

    return (
        <>
            <CustomAlert
                open={showOrderAlert}
                close={() => setShowOrderAlert(false)}
                description=' You must select at least one item to create an order!'
            />
            <CustomAlert
                open={showDeleteAlert}
                close={() => setShowDeleteAlert(false)}
                description=' You must select at least one item to delete!'
            />
            <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Box margin={1}>
                    <TextField
                        label="Search for an item"
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
                <Box display='flex'>
                    <Box marginRight={1}>
                        <Button
                            variant="contained"
                            color="secondary"
                            endIcon={<AddBoxIcon />}
                            onClick={() => setShowNewModal(true)}
                        >
                            New Item
                        </Button>
                    </Box>
                    <Box marginRight={1}>
                        <Button
                            variant="contained"
                            color="secondary"
                            endIcon={<ShoppingCartIcon />}
                            component={Link}
                            onClick={() => checkedItems.length > 0 ? setShowOrderAlert(false) : setShowOrderAlert(true)}
                            to={checkedItems.length > 0 ?
                                {
                                    pathname: '/add-order',
                                    orderItemIds: checkedItems
                                }
                                : '#'}
                        >
                            New Order
                        </Button>
                    </Box>
                    <Box marginRight={1}>
                        <Button
                            variant="contained"
                            color="secondary"
                            endIcon={<DeleteIcon />}
                            onClick={() => checkedItems.length > 0 ? (setShowDeleteAlert(false), setShowDeleteModal(true)) : setShowDeleteAlert(true)}
                        >
                            Delete Items
                        </Button>
                    </Box>
                </Box>
            </Box>
            <CustomModal
                open={showNewModal}
                close={() => setShowNewModal(false)}
                body={
                    <>
                        <Typography variant='h5' align='center'>
                            <b>Item Information</b>
                        </Typography>
                        <TextField
                            required
                            label="Item Name"
                            onChange={e => setDescription(e.target.value)}
                            error={descriptionErr}
                            helperText={descriptionHelperText}
                        />
                        <TextField
                            required
                            label="Price"
                            onChange={e => setPrice(e.target.value)}
                            error={priceErr}
                            helperText={priceHelpertext}
                        />
                        <Box marginTop={2}>
                            <Button
                                variant="contained"
                                color="secondary"
                                endIcon={<CheckCircleIcon />}
                                onClick={() => validateDescription()}
                            >
                                Add Item
                            </Button>
                        </Box>
                    </>
                }
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
                            You are about to <b>delete</b> {checkedItems.length} items!
                            These items will also be removed from all orders.
                            This action cannot be undone.
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            endIcon={<CheckCircleIcon />}
                            onClick={() => deleteItems()}
                        >
                            Confirm
                        </Button>
                    </>
                }
            />
            <CustomTable
                headers={headers}
                body=
                {items.map((item) => (
                    <TableRow hover key={item.item_id}>
                        <TableCell>
                            <FormControlLabel
                                control=
                                {
                                    <Checkbox
                                        value={item.item_id}
                                        onChange={e => changeCheckedItems(e.target.value)}
                                    />
                                }
                            />
                            <Link to={{ pathname: `/item/${item.item_id}` }}>
                                {item.description}
                            </Link>
                        </TableCell>
                        <TableCell>${item.price}</TableCell>
                        <TableCell>{item.qty_on_hand}</TableCell>
                        <TableCell>{item.qty_on_order}</TableCell>
                    </TableRow>
                ))}
            />
        </>
    );
}

export default ItemTable;