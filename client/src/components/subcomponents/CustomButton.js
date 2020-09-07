import React, { useContext } from 'react';
import { WinWidthContext } from '../../context/WinWidthContext';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const useStyles = makeStyles({
    decreaseFontSize: {
        fontSize: 10
    }
});

const CustomButton = ({ label, icon, click, type, link }) => {
    const isSmallScreen = useContext(WinWidthContext);
    const classes = useStyles();
    return (
        <Button
            className={isSmallScreen ? classes.decreaseFontSize : ''}
            size='small'
            variant="contained"
            color="secondary"
            endIcon={icon}
            onClick={click}
            component={type || 'button'}
            to={link || ''}
        >
            {label}
        </Button>
    );
}

export default CustomButton;