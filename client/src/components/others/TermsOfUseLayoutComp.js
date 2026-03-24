import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Grid,
    Typography,
    Divider,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    Chip,
} from "@mui/material";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HeaderComp } from "../common/HeaderComp";
import { useAuth } from "../../authContext";
import HeaderContainerComp from "../common/HeaderContainerComp";
import TermsOfUseComp from "./TermsOfUseComp";

const TermsOfUseLayoutComp = (props) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    useEffect(() => {
        console.log("Point Analysis Layout User Info", user);
        // if (!user) {
        //   navigate("/", { replace: true });
        // }
    }, []);

    return (
        <>
            <HeaderContainerComp
                children={<TermsOfUseComp />}
            ></HeaderContainerComp>
        </>
    );
};

export default TermsOfUseLayoutComp;
