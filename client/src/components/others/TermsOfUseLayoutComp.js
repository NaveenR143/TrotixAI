import React, { useState, useEffect } from "react";
import {
    Box,
    Tabs,
    Tab,
    Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";
import TermsOfUseComp from "./TermsOfUseComp";
import PrivacyPolicyComp from "./PrivacyPolicyComp";

const TermsOfUseLayoutComp = (props) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        console.log("Terms/Privacy Layout User Info", user);
    }, [user]);

    return (
        <Container maxWidth="md" sx={{ py: 2 }}>
            <Box sx={{ 
                borderBottom: 1, 
                borderColor: 'divider', 
                display: 'flex', 
                justifyContent: 'center',
                mb: 1
            }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(e, val) => setActiveTab(val)} 
                    textColor="primary"
                    indicatorColor="primary"
                    aria-label="legal documents tabs"
                >
                    <Tab label="Terms of Use" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1.05rem', px: 4 }} />
                    <Tab label="Privacy Policy" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1.05rem', px: 4 }} />
                </Tabs>
            </Box>
            {activeTab === 0 ? <TermsOfUseComp /> : <PrivacyPolicyComp />}
        </Container>
    );
};

export default TermsOfUseLayoutComp;
