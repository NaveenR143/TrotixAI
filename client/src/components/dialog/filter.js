import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  Slide,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import { filterproperties } from "../../models/usercontent";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function FilterComp(props) {
  const [filterdata, setFilterData] = useState([]);
  const [filtercolumns, setFilterColumns] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});

  useEffect(() => {
    if (props.filterdata.data && props.filterdata.data.length > 0) {
      const cols = filterproperties[props.filterdata.type];
      setFilterColumns(cols);
      setFilterData(props.filterdata.data);



      // Initialize selected filters state
      const initialFilters = {};
      if (cols) {
        cols.forEach(col => {
          initialFilters[col] = null;
        });
      }
      setSelectedFilters(initialFilters);
    }
  }, [props.filterdata]);

  const handleFilterChange = (key, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReset = () => {
    const resetFilters = {};
    filtercolumns.forEach(col => {
      resetFilters[col] = null;
    });
    setSelectedFilters(resetFilters);
  };

  const handleApply = () => {
    if (props.onApply) {
      props.onApply(selectedFilters);
    }
    props.closedialog();
  };

  return (
    <Dialog
      open={props.open}
      TransitionComponent={Transition}
      onClose={props.closedialog}
      aria-describedby="Filter"
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {props.filterdata.name} Filters
        </Typography>
        <IconButton
          aria-label="close"
          onClick={props.closedialog}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {filterdata.length > 0 && filtercolumns && filtercolumns.length > 0 ? (
          <Grid2 container spacing={3}>
            {Object.keys(filterdata[0]).map((key) => {
              if (filtercolumns.includes(key)) {
                const uniqueValues = [
                  ...new Set(filterdata.map((item) => item[key])),
                ].filter((item) => item !== null && item !== undefined && item !== "");


                // Only render if uniqueValues length is greater than 0
                if (uniqueValues.length > 0) {
                  return (
                    <Grid2 size={{ xs: 12, md: 6 }} key={key}>
                      <Autocomplete
                        disablePortal
                        options={uniqueValues}
                        value={selectedFilters[key] || null}
                        onChange={(event, newValue) => handleFilterChange(key, newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={key}
                            variant="outlined"
                            fullWidth
                          />
                        )}
                      />
                    </Grid2>
                  );
                }
              }
              return null;
            })}
          </Grid2>
        ) : (
          <Typography variant="body1" color="text.secondary" align="center">
            No filters available for this data.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={handleReset}
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          Reset All
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          sx={{
            minWidth: 120,
            textTransform: 'none',
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Apply Filters
        </Button>
      </DialogActions>
    </Dialog>
  );
}
