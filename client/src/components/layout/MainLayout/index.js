import React, { createRef, Fragment, useEffect, useRef, useState, lazy, Suspense } from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";
import { makeStyles, styled } from "@mui/styles";
import { Helmet } from "react-helmet-async";
import shpwrite from "@mapbox/shp-write";
import filedownload from "js-file-download";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DownloadIcon from "@mui/icons-material/Download";
import StarIcon from "@mui/icons-material/Star";
import LogoutIcon from "@mui/icons-material/Logout";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  Fade,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  Stack,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Paper,
  Slide,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from "@mui/material";

import { useAuth } from "../../../authContext";

import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import MenuIcon from "@mui/icons-material/Menu";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import LoginIcon from "@mui/icons-material/Login";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
// import { fnAddFacilityMapLayer } from "../../../esrijs/FeatureLayers/facilityfeaturelayer";
// import { fnAddPipelineMapLayer } from "../../../esrijs/FeatureLayers/pipelinefeaturelayer";
import { getCurrentDateTime, getDistinctValues, getDeviceType } from "../../../models/utils";

import { displaySearching } from "../../../redux/searching/Action";
import { addRecentSearch } from "../../../redux/recentsearches/Action";
// import SearchingSpinnerComp from "../../common/customsearchspinner";
// import { FacilityDataView } from "../../data-view/facilitydataview";
// import ExploreGPTsComp from "../../common/ExploreGPTs";
// import fnFetchRenderer from "../../../esrijs/MapProps/facilityrenderer";
import shortid from "shortid";
import { datamessages } from "../../../models/usercontent";

import { ChartFacilityTypes } from "../../../models/facilitytypes";
// import { EChartComp } from "../../../charts/echartcomp";
// import { ShipperDetailsDataView } from "../../data-view/shipperdetailsdataview";
// import DataCoverageComp from "../../common/DataCoverage";

import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";


import logo from "./logo.png";

import { fnAddVirtualMapLayer } from "../../../openlayer/FeatureLayers/virtualfeaturelayer";
import { displaySpinner } from "../../../redux/spinner/Action";
// import PlansComp from "../../dialog/plans";
// import ContactUsComp from "../../dialog/contactus";
// import FilterComp from "../../dialog/filter";
// import SignIn from "../../common/SignIn";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";
// import SidebarComp from "../../common/SidebarComp";
// import Signup from "../../common/SignUp";
import baseurl from "../../../models/config";
// import RecentSearchesComp from "../../common/RecentSearchesComp";
// import PromptSuggestionsComp from "../../common/SuggestionsComp";

const SearchingSpinnerComp = lazy(() => import("../../common/customsearchspinner"));


const useStyles = makeStyles((theme) => ({
  logo: {
    padding: "10px",
    fontSize: "medium",
    fontWeight: 700,
    color: "#575656",
    lineHeight: "2vh",
    fontFamily: "system-ui",
  },
  logoimg: {
    width: "150px",
    height: "auto",
  },
  webmap: {
    "& .esri-ui": {
      zIndex: 100,
    },
    "& .esri-ui .esri-popup": {
      zIndex: 100,
    },
    "& .esri-popup__main-container": {
      zIndex: 100,
    },
  },
}));

const pulseHighlight = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
    text-shadow: 0 0 0px rgba(139, 0, 0, 0);   /* merlot */
  }
  50% {
    transform: scale(1.06);
    opacity: 0.85;
    text-shadow: 0 0 6px rgba(139, 0, 0, 0.6); /* merlot glow */
  }
  100% {
    transform: scale(1);
    opacity: 1;
    text-shadow: 0 0 0px rgba(139, 0, 0, 0);   /* merlot */
  }
`;

const googleAiGlow = keyframes`
  0% {
    border-color: #4285F4;
    box-shadow: 0 0 10px rgba(66, 133, 244, 0.7);
  }
  25% {
    border-color: #DB4437;
    box-shadow: 0 0 10px rgba(219, 68, 55, 0.7);
  }
  50% {
    border-color: #F4B400;
    box-shadow: 0 0 10px rgba(244, 180, 0, 0.7);
  }
  75% {
    border-color: #0F9D58;
    box-shadow: 0 0 10px rgba(15, 157, 88, 0.7);
  }
  100% {
    border-color: #4285F4;
    box-shadow: 0 0 10px rgba(66, 133, 244, 0.7);
  }
`;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const LayerSwitch = styled(Switch)(({ theme }) => ({
  // '& .MuiSwitch-switchBase.Mui-checked': {
  //   color: pink[600],
  //   '&:hover': {
  //     backgroundColor: alpha(pink[600], theme.palette.action.hoverOpacity),
  //   },
  // },
  // "& .MuiSwitch-switchBase.Mui + .MuiSwitch-track": {
  //   // backgroundColor: pink[600],
  //   opacity: "0.3 !important",
  //   padding: "10px !important",
  //   marginTop: "-3px !important",
  // },
  // "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
  //   // backgroundColor: pink[600],
  //   opacity: "0.3 !important",
  //   padding: "10px !important",
  //   marginTop: "-3px !important",
  // },
  "& .MuiSwitch-track": {
    width: "80% !important",
    opacity: "0.3 !important",
    padding: "10px !important",
    marginTop: "-3px !important",
  },
}));

const MainLayout = () => {
  const classes = useStyles();
  const mapRef = useRef(null);
  const mapInitialized = useRef(false);
  const popupRef = useRef(null);
  const userinputRef = useRef(null);

  const [openLogin, setOpenLogin] = useState(false);
  const [opensignup, setOpenSignup] = useState(false);

  // const baseurl = "http://localhost:7000/api/";

  // const baseurl = "/api/";


  const exploreRef = useRef([]);
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(false);

  const ri = useSelector((state) => state.UserReducer.ri);

  const isSearching = useSelector((state) => state.SearchingReducer.searching);

  const recentsearches = useSelector(
    (state) => state.RecentSearchesReducer.recentsearches
  );

  const { user } = useAuth();

  const [displayname, setDisplayname] = useState("Guest");

  const [userinput, setUserInput] = useState("");
  const [userqueries, setUserQueries] = useState([]);
  const [userprompts, setUserPrompts] = useState([]);
  const [lastindex, setLastIndex] = useState(-1);
  const [session_id, setSessionId] = useState("");

  useEffect(() => {
    let sid = sessionStorage.getItem("session_id");
    if (!sid) {
      sid = shortid.generate();
      sessionStorage.setItem("session_id", sid);
    }
    setSessionId(sid);
  }, []);



  const [filterdialogopen, setFilterDialogOpen] = useState(false);
  const fnOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  const fnCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  const fnHandleClearChat = () => {
    // if (userqueries.length > 0) {

    //   setUserPrompts([]);

    // }

    window.location.reload();
  };

  const fnHandleFeedback = async (feedback, qry) => {
    const updatedqueries = userprompts.map((query) => {
      if (query.position === qry.position) {
        return {
          ...query,

          feedback: feedback,
        };
      }
      return query;
    });

    setUserPrompts(updatedqueries);

    // setUserQueries(updatedqueries);

    try {
      const queryDetails = {
        prompt: qry.question,
        feedback: feedback,
      };

      const options = {
        headers: {
          //   authorization: token ? `Bearer ${token}` : "",
        },
      };

      const response = await axios.post(
        `${baseurl}feedback`,
        queryDetails,
        options
      );

      if (
        response.data[0] !== undefined &&
        response.data[0].status === "error"
      ) {
        let errorMessage = "Error occurred while submitting feedback.";

        setNotification({
          ...notification,
          show: true,
          message: errorMessage,
          severity: "error",
        });
      }
    } catch (error) {
      // Hide the spinner and handle errors

      let errorMessage = "Error occurred while submitting feedback.";

      if (error.response && error.response.status === 500) {
        errorMessage = "Server error occurred. Please try again later.";
        // navigate("/", { replace: true });
      }

      setNotification({
        ...notification,
        show: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  const [plansdialogopen, setPlansDialogOpen] = useState(false);
  const fnOpenPlansDialog = (id) => {
    setPlansDialogOpen(true);
  };

  const fnClosePlansDialog = () => {
    setPlansDialogOpen(false);
  };

  const [notification, setNotification] = useState({
    message: "",
    severity: "",
    show: false,
  });

  const fnContactUsChange = (e) => {
    setContactusData({
      ...contactusdata,
      [e.target.name]: e.target.value,
    });

    setErrors({ ...errors, [e.target.name]: "" }); // Clear specific field error
  };


  const [contactusdialogopen, setContactUsDialogOpen] = useState(false);
  const fnOpenContactUsDialog = () => {
    setContactUsDialogOpen(true);
  };

  const fnCloseContactUsDialog = () => {
    setContactUsDialogOpen(false);
  };


  const formatToHtml = (text) => {
    if (!text || typeof text !== "string") return ""; // <-- prevents crash

    return text
      .replace(/\n/g, "<br/>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/(\d+)\.\s\*\*(.*?)\*\*:/g, "<br/><strong>$1. $2:</strong>");
  };



  const fnHandleKeyDown = (event) => {
    if (event.key === "Enter") {
      fnSearchQuery(event);
    }
  };

  const fnHandleChange = (event) => {
    setUserInput(event.target.value);
  };



  // Function to focus the TextField
  const fnFocusUserInputField = () => {
    if (userinputRef.current) {
      userinputRef.current.focus();
    }
  };

  const validateuser = async () => {
    // Make the axios request with Authorization header
    const response = await axios.get(`${baseurl}validateuser`, {
      headers: {
        Authorization: `Bearer ${usertoken}`,
      },
    });

    // console.log(response);
  };

  const fetchUser = async () => {
    const token = await user.getIdToken();

    // console.log(token);

    validateuser();
  };

  const fnSignout = async () => {
    try {
      const response = await signOut(auth);

      // setDisplayname("Guest");

      setNotification({
        ...notification,
        show: true,
        message: "You’ve been logged out. Come back soon!",
        severity: "success",
      });

      window.location.reload(true);
    } catch (error) {
      console.error("Sign Out Error:", error);

      setNotification({
        ...notification,
        show: true,
        message: "Sign-out failed. Please check your connection and try again.",
        severity: "error",
      });
    }
  };

  const [usertoken, setUserToken] = useState("");
  const fnFetchUserToken = async () => {
    const token = await user.getIdToken();

    setUserToken(token);
  };




  useEffect(() => {
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 5000);
  }, [notification]);


  const [termscontent, setTermsContent] = useState({
    start: "",
    end: "",
  });



  const [ismobile, setIsMobile] = useState(false);
  useEffect(() => {
    const deviceType = getDeviceType();
    if (deviceType === "mobile") {
      setIsMobile(true);
    }

    // dispatch(displaySpinner(true));
    // dispatch(displaySearching(false));


    // fnLoadMapView(); // Removed to avoid race conditions; using callback ref instead

    setTermsContent({
      start: "AI-powered insights for U.S. midstream energy infrastructure. ",
      end: "By messaging OilGasGPT, you agree to our",
    });
  }, []);

  return (
    <Suspense fallback={<SearchingSpinnerComp />}>
      <Helmet>
        <title>TrotixAI</title>
        <meta
          name="description"
          content="AI-powered job search using your resume"
        />
      </Helmet>

      <Box sx={{ flexGrow: 1, height: ismobile ? "auto" : "100%" }}>
        <Grid
          container
          direction={ismobile ? "column" : "row"}
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            height: ismobile ? "auto" : "100vh",
          }}
        >
          <Grid item size={ismobile ? 12 : 4}>
            <Box position="relative">
              <Grid
                container
                justifyContent="space-between"
                alignItems="flex-start"
              >
                {/* Logo on the left */}
                <Grid item>
                  <Box className={classes.logo}>
                    <img
                      className={classes.logoimg}
                      src={logo}
                      alt="Logo"
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Bottom-right inside container */}

              <Box
                position="absolute"
                bottom={0}
                right={0}
                p={1}
                textAlign="right"
              >
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<InfoIcon fontSize="small" />}
                  onClick={() => window.open("/info", "_blank")}
                  sx={{
                    textTransform: "none",
                    color: "text.secondary",
                    fontSize: "0.875rem",
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  More Info
                </Button>
                <Typography variant="body2" color="textSecondary">
                  Welcome, <strong>{displayname}</strong>
                </Typography>
              </Box>
            </Box>

            <Divider />

          </Grid>

        </Grid>

      </Box>
    </Suspense>
  );
};

export default MainLayout;
