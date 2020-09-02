import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';


const useStyles = makeStyles({
    btn: {
        color: 'white'
    }
});

const Navbar = () => {
    const classes = useStyles();
    return (
        <AppBar position="static">
            <Toolbar>
                <Button
                    className={classes.btn}
                    component={Link}
                    to={'/items'}>
                    Items
                </Button>
                <Button
                    className={classes.btn}
                    component={Link}
                    to={'/orders'}>
                    Orders
                </Button>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;