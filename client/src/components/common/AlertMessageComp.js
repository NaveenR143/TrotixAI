import {
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import React, { useEffect } from "react";
import Alert from "@mui/lab/Alert";
import FeatherIcon from "feather-icons-react";

import { userinput } from "../../models/usercontent";
import { useDispatch, useSelector } from "react-redux";
import shortid from "shortid";

import * as facilitycolors from "../../esrijs/MapProps/facilitycolors";
import axios from "axios";
import Grid from "@mui/material/Grid2";

export default function AlertMessageComp(props) {
  const dispatch = useDispatch();

  const { className, message, onClose, display, variant, ...other } = props;

  useEffect(() => {}, []);

  return (
    <>
      {display && (
        <Paper
          sx={{
            margin: "auto",
            minWidth: "250px",
            position: "absolute",
            zIndex: 1000,
          }}
        >
          {/* <Alert severity="success">This is a success Alert.</Alert>
        <Alert severity="info">This is an info Alert.</Alert>
        <Alert severity="warning">This is a warning Alert.</Alert> */}
          <Alert severity="error">This is an error Alert.</Alert>
        </Paper>
      )}
    </>
  );
}
