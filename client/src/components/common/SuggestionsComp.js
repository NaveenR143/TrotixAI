import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Box,
  Typography,
  Paper,
  TextField,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import React from "react";
import Alert from "@mui/lab/Alert";
import FeatherIcon from "feather-icons-react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { promptsuggestions } from "../../models/usercontent";

export default function PromptSuggestionsComp({
  setUserInput,
  fnFocusParentInput,
}) {
  const [searchterm, setSearchTerm] = React.useState("");

  // Filter items based on user input
  const filteredItems = promptsuggestions.filter((item) => {
    // Split the search term into an array of words (removes excess whitespace)
    const searchWords = searchterm.trim().toLowerCase().split(/\s+/);

    // Check if each word exists in the item's reference
    return searchWords.every(
      (word) =>
        item.ref.toLowerCase().includes(word) ||
        item.type.toLowerCase().includes(word)
    );
  });

  // Group the filtered items by 'type'
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <>
      <Box sx={{ mt: 1, px: 2 }}>
        <Typography
          variant="caption"
          sx={{ color: "text.disabled", mb: 1, display: "block" }}
        >
          Click a prompt to add and modify your search.
        </Typography>
        <TextField
          label="Type here to filter suggested prompts"
          variant="outlined"
          size="small"
          fullWidth
          value={searchterm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginBottom: 1 }}
        />

        {/* List of filtered items grouped by type */}
        <List
          sx={{ maxHeight: "60vh", overflow: "hidden", overflowY: "scroll" }}
          component="nav"
          aria-labelledby="nested-list-subheader"
        >
          {Object.keys(groupedItems).length > 0 ? (
            Object.keys(groupedItems).map((group, index) => (
              <Accordion key={index}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel-${group}-content`}
                  id={`panel-${group}-header`}
                >
                  <Typography variant="subtitle1">{group}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {groupedItems[group].map((item, idx) => (
                      <ListItemButton key={idx} sx={{ p: 0 }} divider>
                        <ListItemText
                          primary={item.ref}
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{ color: "#bdbdbd !important", display: "block", fontSize: "0.75rem" }}
                            >
                              {item.type}
                            </Typography>
                          }
                          onClick={() => {
                            setUserInput(item.ref);
                            fnFocusParentInput();
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <ListItemButton>
              <ListItemText primary="No results found" />
            </ListItemButton>
          )}
        </List>
      </Box>
      {/* <Paper sx={{ padding: 2, margin: "auto", mt: 4 }}>
        
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={searchterm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        
        <List
          sx={{ width: "100%" }}
          component="nav"
          aria-labelledby="nested-list-subheader"
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              Suggested Prompts
            </ListSubheader>
          }
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <ListItemButton key={index} divider>
                <ListItemText
                  primary={`${item.type} | ${item.ref}`}
                  onClick={() => {
                    props.setUserInput(item.ref);
                    props.closedialog();
                  }}
                />
              </ListItemButton>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No results found" />
            </ListItem>
          )}
        </List>
      </Paper> */}
    </>
  );
}
