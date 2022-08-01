import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

const WinDialog = ({ title, open, handleClose, desc, onExit, onRestart }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {desc}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onExit}>
          Exit
        </Button>
        <Button variant="contained" onClick={onRestart} autoFocus>
          Restart
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WinDialog;
