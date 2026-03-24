import {
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  TextField,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import React from "react";
import Alert from "@mui/lab/Alert";
import FeatherIcon from "feather-icons-react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { promptsuggestions } from "../../models/usercontent";

export default function ExploreGPTsComp(props) {
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
      <Paper sx={{ padding: 2, margin: "auto", mt: 4 }}>
        {/* Search Input */}
        <TextField
          label="Click a prompt to add and modify your search."
          variant="outlined"
          fullWidth
          value={searchterm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginBottom: 1 }}
        />

        {/* MUI List */}
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
                          secondary={item.type}
                          onClick={() => {
                            props.setUserInput(item.ref);
                            props.closedialog();
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
      </Paper>
    </>
  );
}
