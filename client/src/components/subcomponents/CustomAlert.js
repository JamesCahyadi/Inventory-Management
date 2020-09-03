import React from 'react';
import { Alert } from '@material-ui/lab';
import { Collapse, IconButton } from '@material-ui/core';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

const CustomAlert = ({ open, close, description }) => {
    return (
        <Collapse in={open}>
            <Alert
                severity='warning'
                action={
                    <IconButton
                        color="inherit"
                        size="small"
                        onClick={close}
                    >
                        <HighlightOffIcon fontSize="inherit" />
                    </IconButton>
                }
            >
                {description}
            </Alert>
        </Collapse>
    )
}

export default CustomAlert;