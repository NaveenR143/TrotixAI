import React from "react";
import {
    Card,
    CardContent,
    Typography,
    Stack,
    Divider,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Container,
} from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';

export default function PrivacyPolicyComp() {
    const sections = [
        {
            title: "1. Introduction",
            content: `Welcome to the job portal operated by Thanish AI Innovations (OPC) Pvt. Ltd. ("we," "our," or "us"). By using this Platform, you acknowledge and consent to your personal information being shared with recruiters who are registered on the Platform for recruitment and hiring purposes.\n\nThis Privacy Policy explains how we collect, use, process, store, share, and protect your Personal Data when you use our website, mobile application, and related services (collectively, the "Platform"). This Policy is intended to comply with the provisions of India's Digital Personal Data Protection Act, 2023 (DPDPA) and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, as applicable.\n\nUnder the Digital Personal Data Protection Act, 2023, Thanish AI Innovations (OPC) Pvt. Ltd. acts as the Data Fiduciary, determining the purpose and means of processing your Personal Data. You, as a job seeker, employer, or other user of the Platform, act as the Data Principal and are entitled to the rights provided under the DPDPA.`
        },
        {
            title: "2. What Personal Data We Collect",
            content: "We collect personal data only when it is strictly necessary to provide you with our job portal services.",
            list: [
                "Account Registration Data: Name, email address, mobile phone number, and password.",
                "Professional & Educational Data: Resumes/CVs, work history, educational qualifications, skills, job preferences, current location, and salary expectations.",
                "Employer Data: Company name, recruiter contact details, business registration details, and job descriptions.",
                "Communication Data: Records of your interactions with our customer support, and your consent to receive notifications (including WhatsApp, SMS, and email).",
                "Technical & Usage Data: IP address, browser type, device identifiers, and platform usage metrics (collected via cookies to ensure platform security and functionality)."
            ]
        },
        {
            title: "3. How We Use Your Data (Purpose & Lawful Basis)",
            content: "We process your personal data based on your clear, affirmative, and unambiguous consent for the following specific purposes:",
            list: [
                "Service Delivery: To create your profile, match job seekers with prospective employers, and facilitate job applications.",
                "Platform Communications: To send you essential service updates, interview requests, and job alerts via Email, SMS, and WhatsApp.",
                "Profile Visibility: To allow registered employers and recruiters to search our database and view your professional profile (subject to your privacy settings).",
                "Security & Fraud Prevention: To verify accounts, prevent fake job postings, and ensure a safe ecosystem for all users.",
                "Legal Compliance: To comply with applicable Indian laws, court orders, or government requests."
            ]
        },
        {
            title: "4. How We Share Your Data",
            content: "We do not sell your personal data. We only share it with third parties under the following circumstances:",
            list: [
                "Prospective Employers (Data Processors): When you apply for a job or make your profile \"Public,\" your data (resume, contact details) is shared with registered employers to facilitate recruitment.",
                "Service Providers: We use trusted third-party vendors (e.g., cloud hosting providers, WhatsApp Business API providers, SMS gateways) to operate our platform. These vendors act as Data Processors and are legally bound by data processing agreements.",
                "Legal & Regulatory Authorities: We may disclose your data if required by Indian law, law enforcement agencies, or to protect our legal rights."
            ]
        },
        {
            title: "5. Your Rights Under DPDPA 2023",
            content: "As a Data Principal under Indian law, you have specific rights regarding your personal data. We provide built-in tools on our platform to help you exercise these rights easily:",
            list: [
                "Right to Access: You have the right to request a summary of the personal data we hold about you and the identities of all Data Processors and employers we have shared it with.",
                "Right to Correction & Erasure: You can edit, correct, update, or completely delete your profile, resume, and personal data from our servers at any time via your Account Settings.",
                "Right to Withdraw Consent: You may withdraw your consent for data processing at any time (e.g., opt-out of WhatsApp alerts or deactivate your account). Note: Withdrawing consent will not affect the legality of data processed prior to the withdrawal.",
                "Right to Nominate: You have the right to nominate another individual who, in the event of your death or physical/mental incapacity, can exercise your data rights on your behalf.",
                "Right to Grievance Redressal: You have the right to readily available means of resolving grievances regarding your data (see Section 8)."
            ]
        },
        {
            title: "6. Data Retention and Security",
            subSections: [
                {
                    title: "Data Retention",
                    content: "We retain your personal data only for as long as your account is active, or as long as necessary to fulfill the specific purposes outlined in this policy. Once you delete your account or withdraw consent, we will securely erase your data, unless retention is mandated by Indian law."
                },
                {
                    title: "Security",
                    content: "We implement industry-standard encryption, secure server architecture, and access controls to protect your personal data from unauthorized access, alteration, or data breaches."
                }
            ]
        },
        {
            title: "7. Children's Privacy",
            content: "Our platform is strictly intended for individuals who are at least 18 years of age and legally capable of entering into a valid contract under the Indian Contract Act, 1872. We do not knowingly collect or process the personal data of children."
        },
        {
            title: "8. Contact & Grievance Officer",
            content: "In accordance with the DPDPA 2023 and the IT Rules 2021, we have appointed a Grievance Officer to address your data privacy concerns, consent withdrawal requests, or platform complaints.\n\nWe will acknowledge your complaint within 24 hours and aim to resolve it within 15 days.",
            footer: "Name: Grievance Officer\nDesignation: Grievance Officer\nEmail: nr@rightnxt.com\nCompany: Thanish AI Innovations (OPC) Pvt. Ltd.\nAddress: Bengaluru, Karnataka, India\n\nIf your grievance is not resolved satisfactorily, you have the right to appeal to the Data Protection Board of India."
        }
    ];

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        PRIVACY POLICY
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom sx={{ mb: 4 }}>
                        Last Updated: June 1, 2026
                    </Typography>

                    <Stack spacing={4} divider={<Divider />}>
                        {sections.map((section, index) => (
                            <Box key={index}>
                                <Typography variant="h6" component="h3" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                                    {section.title}
                                </Typography>
                                {section.content && (
                                    <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                        {section.content}
                                    </Typography>
                                )}
                                {section.subSections && (
                                    <Box sx={{ mt: 2, pl: 2 }}>
                                        {section.subSections.map((sub, sidx) => (
                                            <Box key={sidx} sx={{ mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                                    {sub.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, color: 'text.secondary' }}>
                                                    {sub.content}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                                {section.list && (
                                    <List sx={{ pl: 2 }}>
                                        {section.list.map((item, idx) => (
                                            <ListItem key={idx} sx={{ py: 0.5, alignItems: 'flex-start' }}>
                                                <ListItemIcon sx={{ minWidth: 24, mt: 1 }}>
                                                    <CircleIcon sx={{ fontSize: 8 }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item}
                                                    primaryTypographyProps={{ variant: 'body2', sx: { lineHeight: 1.6 } }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                {section.footer && (
                                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                        {section.footer}
                                    </Typography>
                                )}
                            </Box>
                        ))}
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
}
