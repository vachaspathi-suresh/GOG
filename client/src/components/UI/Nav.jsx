import React, { useState } from "react";
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
  Tooltip,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  useMediaQuery,
  Badge,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import ConfirmDialog from "./ConfirmDialog";
import AccountSettingsDialog from "../AccountSettings/AccountSettingsDialog";
import MyFriendsDialog from "../AccountSettings/MyFriendsDialog";
import GameInvitesDialog from "./GameInvitesDialog";

const Nav = () => {
  const navigate = useNavigate();
  const currentName = useSelector((state) => state.user.name);
  const currentUserAvatar = useSelector((state) => state.user.avatar);
  const frequests = useSelector((state) => state.requests.friendRequests);
  const grequests = useSelector((state) => state.requests.gameRequests).length;
  const isLogged = useSelector((state) => state.auth.isLoggedIn);
  const logout = useSelector((state) => state.auth.logout);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [friendsDialogOpen, setFriendsDialogOpen] = useState(false);
  const [gRequestsDialogOpen, setGRequestsDialogOpen] = useState(false);
  const smd = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const mdd = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const lgd = useMediaQuery((theme) => theme.breakpoints.down("lg"));

  const handleLogoutDialogClose = () => {
    setLogoutDialogOpen(false);
    setAnchorElUser(null);
  };

  const handleSettingsDialogClose = () => {
    setSettingsDialogOpen(false);
    setAnchorElUser(null);
  };

  const handleFriendsDialogClose = () => {
    setFriendsDialogOpen(false);
    setAnchorElUser(null);
  };

  const handleGameRequestsDialogClose = () => {
    setGRequestsDialogOpen(false);
    setAnchorElUser(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#88F2F7",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Avatar
              alt="GoG"
              src="/GoGLogoF.png"
              sx={{
                width: smd ? "24px" : mdd ? "48px" : lgd ? "56px" : "64px",
                height: smd ? "24px" : mdd ? "48px" : lgd ? "56px" : "64px",
                display: { xs: "flex" },
                mr: 1,
                cursor: "pointer",
              }}
              onClick={() => {
                navigate("/");
              }}
            />
            <Typography
              variant="h4"
              noWrap
              component="a"
              sx={{
                mr: 2,
                display: { xs: "flex" },
                flexGrow: 1,
                fontSize: smd ? "24px" : mdd ? "48px" : lgd ? "56px" : "64px",
                fontFamily: "'Cormorant SC', sans-serif",
                color: "#4A8487",
                textDecoration: "none",
                cursor: "pointer",
              }}
              onClick={() => {
                navigate("/");
              }}
            >
              Goblet of Games
            </Typography>

            {isLogged ? (
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Badge
                      color="secondary"
                      badgeContent={frequests + grequests}
                    >
                      <Avatar
                        alt={currentName}
                        src={`data:image/png;base64,${currentUserAvatar}`}
                        sx={{ bgcolor: "#A6E3E9" }}
                      />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem
                    onClick={() => {
                      setFriendsDialogOpen(true);
                    }}
                  >
                    <Badge
                      color="secondary"
                      badgeContent={frequests}
                      variant="dot"
                    >
                      <Typography textAlign="center">My Friends</Typography>
                    </Badge>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setGRequestsDialogOpen(true);
                    }}
                  >
                    <Badge
                      color="secondary"
                      badgeContent={grequests}
                      variant="dot"
                    >
                      <Typography textAlign="center">Game Invites</Typography>
                    </Badge>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setSettingsDialogOpen(true);
                    }}
                  >
                    <Typography textAlign="center">Account Settings</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setLogoutDialogOpen(true);
                    }}
                  >
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ flexGrow: 0 }}>
                <Button
                  variant="outlined"
                  sx={{ color: "#427578", borderColor: "#427578" }}
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      {logoutDialogOpen && (
        <ConfirmDialog
          title="Logout"
          desc="Logout from your Account"
          open={logoutDialogOpen}
          handleClose={handleLogoutDialogClose}
          onConfirm={() => {
            logout();
            handleLogoutDialogClose();
          }}
        />
      )}
      {settingsDialogOpen && (
        <AccountSettingsDialog
          open={settingsDialogOpen}
          handleClose={handleSettingsDialogClose}
        />
      )}
      {friendsDialogOpen && (
        <MyFriendsDialog
          open={friendsDialogOpen}
          handleClose={handleFriendsDialogClose}
        />
      )}
      {gRequestsDialogOpen && (
        <GameInvitesDialog
          open={gRequestsDialogOpen}
          handleClose={handleGameRequestsDialogClose}
        />
      )}
    </>
  );
};

export default Nav;
