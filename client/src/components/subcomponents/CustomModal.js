import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Modal } from '@material-ui/core';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

const useStyles = makeStyles(theme => ({
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
    }
}));

const CustomModal = ({ open, close, body }) => {
    const classes = useStyles();
    return (
        <Modal
            open={open}
            onClose={close}
            className={classes.modal}
        >
            <div className={classes.modalPaper}>
                <div className={classes.rightAlign}>
                    <IconButton
                        color="inherit"
                        size='small'
                        onClick={close}
                    >
                        <HighlightOffIcon fontSize="inherit" />
                    </IconButton>
                </div>
                {body}
            </div>
        </Modal>
    );
}

export default CustomModal;