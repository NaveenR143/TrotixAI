import {
  AppBar,
  CardActions,
  CardHeader,
  Container,
  CssBaseline,
  Grid2,
  Link,
  Toolbar,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import StarIcon from "@mui/icons-material/Star";

import { Card, CardContent, Typography, Button, Box } from "@mui/material";

import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  "@global": {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: "none",
    },
  },
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbar: {
    flexWrap: "wrap",
  },
  toolbarTitle: {
    flexGrow: 1,
  },
  link: {
    margin: theme.spacing(1, 1.5),
  },
  heroContent: {
    padding: theme.spacing(2, 0, 2),
  },
  cardRoot: {
    borderRadius: "5px !important",
    borderTop: "5px solid rgb(92, 91, 91)",
    border: "1px solid rgba(72, 71, 71, 0.07)",
  },
  cardHeader: { fontSize: "large !important", padding: "5px !important" },
  cardPricing: {
    display: "flex",
    justifyContent: "center",
    alignItems: "baseline",
    marginBottom: theme.spacing(2),
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
  },
}));

export default function Plans(props) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [showAll, setShowAll] = useState(true);

  const tiers = [
    {
      title: "Free",
      price: "0",
      description: [
        "Search Facilities/Pipelines by name or location.",
        "View pipelines with direction.",
        "Locate facilities/pipelines by lat/long within a specific radius (limited radius).",
        "View Pipeline Shipper Details.",
        "Access Pipeline Tariff Details (basic info).",
        "View Pipeline Daily Flow for the past 7 days.",
        "See Gas Plant Production for the past 3 months.",
        "List of Wells by Operator (basic view).",
        "View Nearest Gathering Systems in Texas by Lat/Long.",
      ],
      buttonText: "Sign up for free",
      buttonVariant: "outlined",
    },
    {
      title: "Pro",
      subheader: "Most popular",
      price: "20",
      description: [
        "Maintain session data on page refresh",
        "View connected pipelines to facilities or other pipelines",
        "Download data in CSV, Shapefile, or GeoJSON format",
        "View and download pipeline daily flow data for the past year",
        "View and download gas plant production, disposition, and intake data for the past year",
        "View wells connected to gathering systems",
        "View facilities and pipelines connected to gathering systems",
      ],
      buttonText: "Get started",
      buttonVariant: "contained",
    },
    {
      title: "Enterprise",
      price: "",
      description: [
        "Save and manage user workflows",
        "Access solution-specific customized workflows",
        "View historical pipeline daily flow data",
        "Access historical gas plant production, disposition, and intake data",
        "Facilities connected to pipelines",
        "Perform point analysis with integrated weather information",
        "Access tariff information by start and end location, along with detailed breakdowns",
        "Unlock extended analysis, advanced reports, and more...",
      ],
      buttonText: "Contact us",
      buttonVariant: "outlined",
    },
  ];

  const fnPlansSelection = (plantype) => {
    if (plantype === "Enterprise") {
      props.contactus();
    }
  };

  return (
    <React.Fragment>
      <CssBaseline />

      <Container maxWidth="sm" component="main" className={classes.heroContent}>
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="textPrimary"
          gutterBottom
        >
          Choose a plan
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="textSecondary"
          component="p"
        >
          Select the Features That Best Aligns With Your Business Goals
        </Typography>
      </Container>
      {/* End hero unit */}
      <Container maxWidth="md" component="main">
        <Grid2 container alignItems="flex-start">
          {tiers.map((tier) => (
            // Enterprise card is full width at sm breakpoint
            <Grid2 item key={tier.title} size={4}>
              <Card
                className={classes.cardRoot}
                sx={{
                  // border:
                  //   tier.title === "Pro" ? "2px solid rgb(92, 91, 91)" : "",
                  borderTop:
                    tier.title === "Enterprise"
                      ? "5px solid rgb(163, 3, 3)"
                      : "5px solid rgb(92, 91, 91)",
                }}
              >
                <CardHeader
                  title={tier.title}
                  // subheader={tier.subheader}
                  titleTypographyProps={{
                    align: "center",
                    fontSize: "large !important",
                    textTransform: "uppercase",
                  }}
                  // subheaderTypographyProps={{ align: "center" }}
                  action={tier.title === "Pro" ? <StarIcon /> : null}
                  className={classes.cardHeader}
                />

                <CardContent sx={{ pt: "0" }}>
                  <div className={classes.cardPricing}>
                    <Typography component="h5" variant="h5" color="textPrimary">
                      $
                    </Typography>
                    <Typography component="h1" variant="h1" color="textPrimary">
                      {tier.price}
                    </Typography>
                    <Typography variant="h5" color="textSecondary">
                      /mo
                    </Typography>
                  </div>
                  {tier.title !== "Free" && (
                    <CardActions>
                      <Button
                        fullWidth
                        variant={tier.buttonVariant}
                        color="primary"
                        onClick={() => fnPlansSelection(tier.title)}
                      >
                        {tier.buttonText}
                      </Button>
                    </CardActions>
                  )}
                  <ul
                    style={{
                      listStyleType: "disc",
                      paddingLeft: "10px",
                      maxWidth: "200px",
                    }}
                  >
                    {tier.description.map(
                      (line, index) =>
                        (showAll || index < 4) && (
                          <Typography
                            component="li"
                            variant="subtitle1"
                            align="left"
                            sx={{ mt: "10px", fontStretch: "expanded" }}
                            key={line}
                          >
                            {line}
                          </Typography>
                        )
                    )}
                    {tier.description.length > 4 && (
                      <Button
                        size="small"
                        onClick={() => setShowAll(!showAll)}
                        sx={{
                          mt: 1,
                          textTransform: "none",
                          paddingLeft: "5px",
                        }}
                      >
                        {showAll ? "Show less" : "Show more..."}
                      </Button>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </React.Fragment>
  );
}
