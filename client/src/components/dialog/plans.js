import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
} from "@mui/material";
import Plans from "../common/Plans";
import CloseIcon from "@mui/icons-material/Close";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function PlansComp(props) {
  return (
    <>
      <Dialog
        open={props.plansdialog}
        TransitionComponent={Transition}
        onClose={props.closedialog}
        aria-describedby="Plans"
        fullScreen
      >
        <DialogTitle>
          <IconButton
            edge="end"
            color="inherit"
            onClick={props.closedialog}
            aria-label="close"
            sx={{
              position: "absolute",
              right: 10,
              top: 0,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Plans contactus={props.contactus} />
        </DialogContent>
      </Dialog>
    </>
  );
}
