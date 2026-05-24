import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, Paper } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import NavBarLogo from "../../common/NavBarLogo";

const useStyles = makeStyles((theme) => ({
  logo: {
    padding: "18px",
    fontSize: "medium",
    fontWeight: 700,
    color: "#575656",
    marginTop: "10px",
    lineHeight: "40px",
    fontFamily: "'Open Sans', Verdana, sans-serif",
  },
}));

const AppLayout = () => {
  const classes = useStyles();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid
        container
        direction="row"
        spacing={3}
        sx={{
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Grid item size={2}>
          <NavBarLogo />
        </Grid>
        <Grid item size={8}>
          <Paper sx={{ height: "100%" }}>
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[51.505, -0.09]}>
                <Popup>
                  A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
              </Marker>
            </MapContainer>
          </Paper>
        </Grid>
        <Grid item size={2}></Grid>
      </Grid>
    </Box>
  );
};

export default AppLayout;
