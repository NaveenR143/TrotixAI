import React, { useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import baseurl from "../../models/config";
import { useDispatch, useSelector } from "react-redux";
import { SET_RECENTSEARCHES } from "../../redux/constants";

export default function RecentSearchesComp({
  fnSearchQueryFromRecentSearches,
  usertoken,
}) {
  // const baseurl = "http://localhost:7000/api/";

  const dispatch = useDispatch();

  // const baseurl = "/api/";
  const recentsearches = useSelector(
    (state) => state.RecentSearchesReducer.recentsearches
  );

  // const [suggestions, setSuggestions] = React.useState([
  //   "Gas plants in Permian Basin",
  //   "Alliance pipeline",
  //   "Powerplants within 20-mile radius of 43.613001, -85.479469",
  //   "casper gas plant",
  //   "gas plants with processing capacity around 100",
  //   "gas plants of Kinder Morgan",
  //   "Baton Rouge operated pipelines",
  // ]);
  const fnFetchUserPromptsHistory = async () => {
    if (recentsearches.length === 0) {
      try {
        const options = {
          headers: {
            authorization: `Bearer ${usertoken}`,
          },
        };

        const response = await axios.post(
          `${baseurl}userpromptshistory`,
          {},
          options
        );

        if (
          response.data[0] !== undefined &&
          response.data[0].data.length > 0
        ) {
          // Remove duplicates and store in Redux
          const uniqueSearches = [...new Set(response.data[0].data)];

          dispatch({ type: SET_RECENTSEARCHES, payload: uniqueSearches });
          // setSuggestions((prev) => {
          //   const combined = [...response.data[0].data, ...prev];
          //   return [...new Set(combined)]; // remove duplicates
          // });
        }
      } catch (error) {}
    }
  };

  useEffect(() => {
    if (usertoken !== "") {
      fnFetchUserPromptsHistory();
    }
  }, [usertoken]);

  // useEffect(() => {
  //   console.log(JSON.stringify(suggestions));
  // }, [suggestions]);

  return (
    <Box sx={{ mt: 1, px: 2 }}>
      <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
        Recent Searches
      </Typography>

      <Typography
        variant="caption"
        sx={{ color: "text.disabled", mb: 1, display: "block" }}
      >
        Click on prompt to search
      </Typography>

      <List
        dense
        disablePadding
        sx={{ maxHeight: "60vh", overflow: "hidden", overflowY: "scroll" }}
      >
        {recentsearches.map((text, index) => (
          <ListItem
            key={index}
            button
            onClick={() => fnSearchQueryFromRecentSearches(text)}
            sx={{
              py: 0.5,
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "#f1f5f9",
                cursor: "pointer", // 👈 Add this
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.8rem", color: "text.secondary" }}
                >
                  {text}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
