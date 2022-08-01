import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AccountCircle,
  Key,
  NavigateNext,
  NoAccounts,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { delAccountRoute } from "../../utils/APIRoutes";
import useHTTP from "../../hooks/use-http";
import ChangePassword from "../Auth/ChangePassword";
import ConfirmDialog from "../UI/ConfirmDialog";

const toastOptions = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

function AccountSettingsDialog({ open, handleClose }) {
  const navigate = useNavigate();
  const currentUserName = useSelector((state) => state.user.username);
  const token = useSelector((state) => state.auth.token);
  const logout = useSelector((state) => state.auth.logout);
  const [changePassDialogOpen, setChangePassDialogOpen] = useState(false);
  const [delDialogOpen, setDelDialogOpen] = useState(false);
  const { clearError: delClearError, sendRequest: delSendRequest } = useHTTP();

  const delAccount = async () => {
    try {
      await delSendRequest(delAccountRoute, "POST", null, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      });
      setDelDialogOpen(false);
      logout();
      handleClose();
      toast.success(
        `Your Account '${currentUserName}' is Deleted Successfully!!`,
        toastOptions
      );
    } catch (err) {
      toast.error(err.message, {
        ...toastOptions,
        onClose: () => {
          delClearError();
        },
      });
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Account Settings</DialogTitle>
        <DialogContent>
          <List>
            <ListItemButton
              sx={{ padding: 2 }}
              onClick={() => navigate("/avatar")}
            >
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Change Avatar" />
              <NavigateNext />
            </ListItemButton>
            <Divider />
            <ListItemButton
              sx={{ padding: 2 }}
              onClick={() => setChangePassDialogOpen(true)}
            >
              <ListItemIcon>
                <Key />
              </ListItemIcon>
              <ListItemText primary="Change Password" />
              <NavigateNext />
            </ListItemButton>
            <Divider />
            <ListItemButton
              sx={{ padding: 2 }}
              onClick={() => setDelDialogOpen(true)}
            >
              <ListItemIcon>
                <NoAccounts />
              </ListItemIcon>
              <ListItemText primary="Delete Account" />
              <NavigateNext />
            </ListItemButton>
          </List>
        </DialogContent>
      </Dialog>

      {changePassDialogOpen && (
        <ChangePassword
          open={changePassDialogOpen}
          handleClose={() => setChangePassDialogOpen(false)}
        />
      )}
      {delDialogOpen && (
        <ConfirmDialog
          title="Delete Account"
          desc="Delete your Account, All your DATA will be lost"
          open={delDialogOpen}
          handleClose={() => setDelDialogOpen(false)}
          onConfirm={delAccount}
        />
      )}
    </>
  );
}

export default AccountSettingsDialog;
