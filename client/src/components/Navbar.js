import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';


const useStyles = makeStyles({
    white: {
        color: 'white'
    }
});

const Navbar = () => {
    const classes = useStyles();
    const menus = ['items', 'orders'];

    return (
        <AppBar position="static">
            <Toolbar>
                {menus.map((menu) => (
                    <Button
                        className={classes.white}
                        component={Link}
                        to={{ pathname: `/${menu}` }}>
                        {menu}
                    </Button>
                ))}
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;