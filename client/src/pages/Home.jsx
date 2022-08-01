import React, { useEffect } from "react";
import {
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import Nav from "../components/UI/Nav";
import { getFriendRequestsRoute } from "../utils/APIRoutes";
import useHTTP from "../hooks/use-http";
import { requestsAction } from "../store/requests";

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { sendRequest: getFriendRSendRequest } = useHTTP();

  useEffect(() => {
    const getFRequests = async () => {
      try {
        const responseData = await getFriendRSendRequest(
          getFriendRequestsRoute,
          "POST",
          null,
          {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        );
        dispatch(
          requestsAction.setFriendRequests(responseData.requests.length)
        );
      } catch (err) {
        console.error(err);
      }
    };
    if (!!token) getFRequests();
  }, [dispatch, getFriendRSendRequest, token]);

  return (
    <>
      <Nav />
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          padding: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          sx={{ m: 5 }}
        >
          <Grid item xs>
            <Card raised sx={{ maxWidth: 345, minWidth: 225 }}>
              <CardActionArea onClick={() => navigate("/game/tic-tac-toe")}>
                <CardMedia
                  component="img"
                  height="240"
                  image="/xox_pof.jpg"
                  alt="Tic Tac Toe"
                />
                <CardContent sx={{ bgcolor: "#B5F9FF" }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{ fontFamily: "cursive", fontWeight: "800" }}
                  >
                    Tic Tac Toe
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Home;
