import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import AddBoxIcon from '@material-ui/icons/AddBox';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { Alert } from '@material-ui/lab';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    Button,
    FormControlLabel,
    Checkbox,
    Collapse,
    IconButton,
    Modal,
    TextField,
    Typography
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    table: {
        minWidth: 650,
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalPaper: {
        textAlign: 'center',
        position: 'absolute',
        maxWidth: 300,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        paddingBottom: 5
    },
    rightAlign: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginRight: 2
    },
    addItemBtn: {
        marginTop: 10
    }
}));

const ItemTable = () => {
    const classes = useStyles();
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


    const getItems = async () => {
        try {
            const response = await fetch(`/items`);
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
            const response = await fetch('/items', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } catch (error) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        getItems();
    }, [items]);

    return (
        <>
            <Collapse in={showOrderAlert}>
                <Alert
                    severity='warning'
                    action={
                        <IconButton
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setShowOrderAlert(false);
                            }}
                        >
                            <HighlightOffIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    You must select at least one item to create an order!
                </Alert>
            </Collapse>
            <Collapse in={showDeleteAlert}>
                <Alert
                    severity='warning'
                    action={
                        <IconButton
                            color="inherit"
                            size="small"
                            onClick={() => {
                                setShowDeleteAlert(false);
                            }}
                        >
                            <HighlightOffIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    You must select at least one item to delete an order!
                </Alert>
            </Collapse>

            <Button
                variant="contained"
                color="secondary"
                startIcon={<ShoppingCartIcon />}
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
            <Button
                variant="contained"
                color="secondary"
                startIcon={<AddBoxIcon />}
                onClick={() => setShowNewModal(true)}
            >
                New Item
            </Button>
            <Button
                variant="contained"
                color="secondary"
                startIcon={<DeleteIcon />}
                onClick={() => checkedItems.length > 0 ? (setShowDeleteAlert(false), setShowDeleteModal(true)) : setShowDeleteAlert(true)}
            >
                Delete Items
            </Button>
            <Modal
                open={showNewModal}
                onClose={() => setShowNewModal(false)}
                className={classes.modal}
            >
                <div className={classes.modalPaper}>
                    <div className={classes.rightAlign}>
                        <IconButton
                            className={classes.modalClose}
                            color="inherit"
                            size='small'
                            onClick={() => setShowNewModal(false)}
                        >
                            <HighlightOffIcon fontSize="inherit" />
                        </IconButton>
                    </div>
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
                    <Button
                        className={classes.addItemBtn}
                        variant="contained"
                        color="primary"
                        endIcon={<CheckCircleIcon />}
                        onClick={() => validateDescription()}
                    >
                        Add Item
                    </Button>
                </div>
            </Modal>
            <Modal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                className={classes.modal}
            >
                <div className={classes.modalPaper}>
                    <div className={classes.rightAlign}>
                        <IconButton
                            className={classes.modalClose}
                            color="inherit"
                            size='small'
                            onClick={() => setShowDeleteModal(false)}
                        >
                            <HighlightOffIcon fontSize="inherit" />
                        </IconButton>
                    </div>
                    <Typography variant='h5' align='center' gutterBottom>
                        <b>Delete Item Confirmation</b>
                    </Typography>
                    <Typography align='center' paragraph>
                        You are about to <b>delete</b> {checkedItems.length} items!
                        These items will also be removed from all orders.
                        This action cannot be undone.
                    </Typography>
                    <Button
                        className={classes.addItemBtn}
                        variant="contained"
                        color="primary"
                        endIcon={<CheckCircleIcon />}
                        onClick={() => deleteItems()}
                    >
                        Confirm
                    </Button>
                </div>
            </Modal>
            <TableContainer component={Paper}>
                <Table className={classes.table} size="small">
                    <TableHead>
                        <TableRow selected>
                            <TableCell>
                                Item
                            </TableCell>
                            <TableCell>Unit Price</TableCell>
                            <TableCell>Qty on Hand</TableCell>
                            <TableCell>Qty on Order</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
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
                                    <Link to={
                                        {
                                            pathname: `/item/${item.item_id}`,
                                            items: items
                                        }}
                                    >
                                        {item.description}
                                    </Link>
                                </TableCell>
                                <TableCell>${item.price}</TableCell>
                                <TableCell>{item.qty_on_hand}</TableCell>
                                <TableCell>{item.qty_on_order}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

export default ItemTable;