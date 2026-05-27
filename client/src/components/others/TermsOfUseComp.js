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
    Link,
    Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CircleIcon from '@mui/icons-material/Circle';

export default function TermsOfUseComp() {
    const navigate = useNavigate();

    const sections = [
        {
            title: "1. Your Acceptance and Contractual Relationship",
            content: "You represent and warrant that you are of age under the laws of your jurisdiction (at least 18 years old in India) and/or lawfully able to enter into contracts under the Indian Contract Act, 1872. If you are not legally able to enter contracts, you shall not use the Service at any time or in any manner."
        },
        {
            title: "2. Privacy",
            content: "Your privacy is important to us. Please review Provider’s Privacy Policy which explains how we use information that you submit to Provider and the choices you can make about the way this information is collected and used. The Privacy Policy is hereby incorporated by reference."
        },
        {
            title: "3. Modifications to the Terms or to the Service",
            subSections: [
                {
                    title: "(a) Terms",
                    content: "Provider can change, update, add or remove provisions of these Terms, at any time by posting the updated Terms on the Site and by providing a notice on the Site. Material changes to the Terms will be notified either by posting a notice on the Dashboard or sending you an email/WhatsApp."
                },
                {
                    title: "(b) Service",
                    content: "Provider may make changes to the Service at any time, without notice. If you object to any changes to the Service, your only recourse will be to cease using it."
                }
            ]
        },
        {
            title: "4. Use of Our Service and Accounts",
            content: "We provide resume and curriculum vitae building, document storage services, resume databases, job portals, and other career enhancement tools.",
            subSections: [
                {
                    title: "(a) Visitors & Registered Users",
                    content: "Visitors may browse the Site but will not have full access to the Service without first becoming “Registered Users”. You must provide true, accurate, current, and complete information. You are responsible for all activities under your Account."
                },
                {
                    title: "(b) Access through Social Networking Sites",
                    content: "If you access the Service through an SNS, you may link your Account with Third-Party Accounts. Provider makes no effort to review any SNS Content for accuracy, legality, or non-infringement."
                }
            ]
        },
        {
            title: "5. Your Content and Your License to Us",
            content: "“User Content” means, without limitation, your Account information, resume, career history, profile entries, posts, questions, and/or any other information you provide on or through the Service.",
            footer: "You retain ownership of your User Content. However, by Make Available any User Content within the Service, you automatically grant Provider a worldwide, perpetual, irrevocable, non-exclusive, royalty-free, sublicensable, and transferable license to use, copy, reproduce, process, adapt, modify, publish, transmit, distribute, prepare derivative works of, display, and perform the User Content in connection with the Service."
        },
        {
            title: "6. Deletion or Deactivation of User Content and/or your Account",
            content: "Your User Content can only be completely deleted from public view by deactivating or deleting your Account. When you deactivate your Account, we will retain logs and non-personally identifiable information about you along with an archival copy of your information for recordkeeping and compliance with Indian law."
        },
        {
            title: "7. Our Community and Our Acceptable Use Policy",
            content: "You will not use the Service to transmit, distribute or store material in a manner that: (i) violates any applicable law or regulation; (ii) may adversely affect the Service or other Users; (iii) may expose Provider to criminal or civil liability, or (iv) violate, infringe upon or otherwise misappropriate any third-party rights.",
            subSections: [
                {
                    title: "System Abuse",
                    content: "You agree not to scrape, use automated software or AI tools to download content, interfere with our servers, reverse engineer our software, or use our data to build competitive products."
                },
                {
                    title: "Content Limitations",
                    content: "You must not post defamatory, obscene, racist, harassing, or illegal content, or infringe upon any intellectual property rights."
                }
            ]
        },
        {
            title: "8. Additional Services",
            subSections: [
                {
                    title: "A. Resume Posting & Job Alerts",
                    content: "Provider may facilitate the posting of your resume on various third-party sites. We may provide job alerts matching employment opportunities with your resume via email or WhatsApp."
                },
                {
                    title: "B. Resume Parsing",
                    content: "We may include metadata in your resume to share with third parties (ATS, employers) to facilitate your application process."
                },
                {
                    title: "C. Digital Resume and Public Database",
                    content: "If you create a Profile, it will be publicly available online and part of our public digital resume database."
                },
                {
                    title: "D. Artificial Intelligence Tools",
                    content: "Provider may use third-party AI tools and machine learning to deliver Services. Provider disclaims any liability that may arise from content generated by third-party AI tools."
                }
            ]
        },
        {
            title: "9. Payments and Subscriptions",
            content: "If you purchase any Services, you agree that Provider’s third-party payment gateways (compliant with RBI regulations) may store your payment information. You agree to pay the applicable fees plus all related taxes (such as GST). Pricing may vary and transactions may be subject to currency conversion fees if applicable."
        },
        {
            title: "10. Cancellations",
            content: "You may cancel your subscription anytime by contacting our customer service department or by going to the online cancel page. We do not warrant that product specifications or pricing are error-free and reserve the right to cancel orders in our sole discretion."
        },
        {
            title: "11. Our Intellectual Property, Trademarks and Copyrights",
            content: "Except for User Content, Provider owns all rights, title and interest in the Service. The Service is protected by copyright, trademark, and other intellectual property laws of India."
        },
        {
            title: "12. Your Use of Materials",
            content: "You may copy, access, download and display Materials strictly for non-commercial, personal use. Decompiling, reverse engineering, disassembling, or otherwise reducing the code used in any software on the Service is strictly prohibited."
        },
        {
            title: "13. Public Discourse and Forums",
            content: "Provider cannot guarantee that other Users will not use the ideas and information that you share in public forums. When you disclose information in the Forums, you do so at your own risk."
        },
        {
            title: "14. Copyright and Infringement Notification Policy",
            content: "In accordance with the Information Technology Act, 2000 and the Copyright Act, 1957, if you believe your copyright or other intellectual property right is being infringed, please provide written notice to our Grievance Officer at:",
            footer: "Email: nr@rightnxt.com\nAttn: Legal Department, Thanish AI Innovations (OPC) Pvt. Ltd."
        },
        {
            title: "15. User Interactions and Release",
            content: "You are solely responsible for your interactions with other users and employers. If you have a dispute with one or more users, you hereby release Thanish AI Innovations (OPC) Pvt. Ltd. from any claims, demands, liabilities, and damages arising out of such disputes."
        },
        {
            title: "16. Disclaimer of Warranties",
            content: "YOUR USE OF THE SERVICE IS AT YOUR OWN RISK. THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE”. TO THE FULLEST EXTENT PERMISSIBLE BY INDIAN LAW, THANISH AI INNOVATIONS (OPC) PVT. LTD. DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT."
        },
        {
            title: "17. Limitation of Liability",
            content: "THE PROVIDER DISCLAIMS ALL LIABILITY FOR ANY LOSS OR DAMAGE (DIRECT, INDIRECT, PUNITIVE, ACTUAL, CONSEQUENTIAL, INCIDENTAL, SPECIAL, OR OTHERWISE) RESULTING FROM ANY USE OR MISUSE OF, OR INABILITY TO USE, THE SITE OR SERVICES."
        },
        {
            title: "18. Indemnity",
            content: "You agree to indemnify and hold harmless Thanish AI Innovations (OPC) Pvt. Ltd. and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, costs, or expenses, including reasonable legal fees, resulting from your breach of these Terms."
        },
        {
            title: "19. WhatsApp & Electronic Communications Consent",
            content: "By creating an account and using our Services, you explicitly consent to receive communications from Thanish AI Innovations (OPC) Pvt. Ltd. across various electronic channels, including but not limited to WhatsApp, SMS, email, and push notifications.",
            subSections: [
                {
                    title: "Scope of Messages",
                    content: "You agree that we may send you messages of any type via WhatsApp and other channels, which may include:"
                }
            ],
            list: [
                "Account & Service Notifications: Password resets, subscription updates, billing information.",
                "Career & Job Alerts: New job matches, interview requests, application statuses, and messages from prospective employers.",
                "Marketing & Promotional Materials: Offers, discounts, newsletters, and announcements regarding new tools or features.",
                "Customer Support: Responses to your inquiries and assistance with the platform."
            ],
            footer: "For contractual purposes, you agree that all terms, notices, disclosures, and communications provided electronically satisfy any requirement that such communications be in writing. You may manage your communication preferences or opt-out of promotional WhatsApp messages at any time through your Account Settings or by following the opt-out instructions provided within the messages."
        },
        {
            title: "20. Governing Law",
            content: "These Terms shall be governed by, construed, and enforced in accordance with the laws of India, without regard to its conflict of law principles. Both parties submit to the exclusive jurisdiction of the competent courts located in Bengaluru, Karnataka, India for any actions that are not subject to arbitration."
        },
        {
            title: "21. Binding Arbitration Agreement and Class Action Waiver",
            content: "PLEASE READ THIS SECTION CAREFULLY – IT MAY SIGNIFICANTLY AFFECT YOUR LEGAL RIGHTS.",
            subSections: [
                {
                    title: "(a) Arbitrating Disputes",
                    content: "Any dispute, claim, or controversy relating in any way to these Terms or the Provider’s services shall be resolved exclusively through final and binding individual arbitration governed by the Arbitration and Conciliation Act, 1996 (India)."
                },
                {
                    title: "(b) Arbitration Process",
                    content: "The arbitration shall be conducted by a single, neutral arbitrator mutually appointed by both parties. The seat and venue of the arbitration shall be Bengaluru, Karnataka, India, and the language of the arbitration shall be English."
                },
                {
                    title: "(c) Class Action Waiver",
                    content: "YOU AND THE PROVIDER AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING. The arbitrator may not consolidate proceedings for more than one person’s claims."
                }
            ]
        },
        {
            title: "22. Local Regulations",
            content: "The Site is controlled and operated by Thanish AI Innovations (OPC) Pvt. Ltd. from India. If you choose to access the Service from locations outside India, you do so on your own initiative and are responsible for compliance with local laws."
        },
        {
            title: "23. Grievance Officer (India Compliance)",
            content: "In accordance with the Information Technology Act, 2000 and the rules made thereunder, the name and contact details of the Grievance Officer are provided below:",
            footer: "Email: nr@rightnxt.com\nAddress: Thanish AI Innovations (OPC) Pvt. Ltd., Bengaluru, Karnataka, India."
        },
        {
            title: "24. General",
            content: "If any provision of these Terms shall be unlawful, void, or for any reason unenforceable, then that provision shall be deemed severable from this agreement and shall not affect the validity and enforceability of any remaining provisions."
        },
        {
            title: "25. Contact Us",
            content: "Please forward any comments or complaints about the Site to:",
            footer: "Email: nr@rightnxt.com\nCompany: Thanish AI Innovations (OPC) Pvt. Ltd.\nLocation: Bengaluru, Karnataka, India"
        }
    ];

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        TERMS OF USE
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom sx={{ mb: 4 }}>
                        Last Updated: April 1, 2025
                    </Typography>

                    <Box sx={{ my: 4 }}>
                        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                            Welcome! These Terms of Use and all other legal documents incorporated by reference (collectively, the “Terms”) set forth the legal contract between Thanish AI Innovations (OPC) Pvt. Ltd. and each end user (“User” or “you” or “your”) with respect to access to and use of our associated internet properties as linked and offered by us, our subsidiaries and affiliated companies, and any software that we provide to you for download in your mobile devices (each a “mobile application”) (all of these collectively, the “Site”). Throughout this contract, Thanish AI Innovations (OPC) Pvt. Ltd. is collectively called the “Provider”, “we,” or “us”. Unless otherwise specified, all references to “Site” also include the use of our online platform, materials, proprietary content, tools, software, and services available through the Site (collectively, all of these and the Site are called the “Service”).
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                            PLEASE READ THESE TERMS CAREFULLY BEFORE USING THE SERVICE, BECAUSE THEY AFFECT YOUR LEGAL RIGHTS AND OBLIGATIONS. IF YOU DO NOT AGREE TO BE BOUND BY THESE TERMS, OR IF AT ANY TIME, THE TERMS ARE NO LONGER ACCEPTABLE TO YOU, PLEASE CEASE USE OF THE SERVICE IMMEDIATELY. THE SITE IS DIRECTED TO PEOPLE WITHIN INDIA. CONTENT AVAILABLE ON OR THROUGH THE SITE MAY NOT BE APPROPRIATE OR AVAILABLE IN OTHER LOCATIONS. THE PROVIDER MAY LIMIT THE AVAILABILITY OF THE SITE AND SERVICE TO ANY PERSON OR GEOGRAPHIC AREA AT ANY TIME. IF YOU ACCESS THE SITE FROM OUTSIDE INDIA, YOU DO SO AT YOUR OWN RISK.
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', whiteSpace: 'pre-line' }}>
                            SECTION 24 CONTAINS AN ARBITRATION CLAUSE AND CLASS ACTION WAIVER. BY AGREEING TO THESE TERMS, YOU AGREE (A) TO RESOLVE ALL DISPUTES (WITH LIMITED EXCEPTIONS) RELATED TO THE PROVIDER’S SERVICES AND/OR PRODUCTS THROUGH BINDING INDIVIDUAL ARBITRATION, WHICH MEANS THAT YOU WAIVE ANY RIGHT TO HAVE THOSE DISPUTES DECIDED BY A JUDGE, AND (B) TO WAIVE YOUR RIGHT TO PARTICIPATE IN CLASS ACTIONS, CLASS ARBITRATIONS, OR REPRESENTATIVE ACTIONS, AS SET FORTH BELOW.
                        </Typography>
                    </Box>

                    {/* Terms of Use Highlights Callout Box */}
                    <Box sx={{
                        bgcolor: 'action.hover',
                        p: 3,
                        borderRadius: 2,
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                        my: 4
                    }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Terms of Use Highlights
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Please also read our full Terms of Use below.
                        </Typography>
                        <Stack spacing={2.5}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Your Acceptance</Typography>
                                <Typography variant="body2" color="text.secondary">Each time you access and/or use the Service, you agree to be bound by these Terms and any Additional Terms that will apply to you, prospectively.</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Your Privacy</Typography>
                                <Typography variant="body2" color="text.secondary">We collect certain information to perform the Service and to allow Provider and/or third parties to find and contact you as part of the services provided. You can find more information in our Privacy Policy.</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Payments, Subscriptions and Cancellations</Typography>
                                <Typography variant="body2" color="text.secondary">You will honor your payment obligations for services you purchase on the Site. You understand that additional fees and taxes may apply to your purchase. You may cancel your subscription at any time by going to the home page under My Accounts and My Settings.</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Arbitration of All Disputes; No Class Relief</Typography>
                                <Typography variant="body2" color="text.secondary">Any disputes under these Terms will be resolved on an individual basis through binding arbitration in India, with no class relief.</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Our Content and Intellectual Property</Typography>
                                <Typography variant="body2" color="text.secondary">You may not use, copy, reproduce, republish, upload, sell, resell, display, post, transmit, distribute, scrape, reverse engineer, or license any content or intellectual property on the Service without the Provider’s authorization.</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>WhatsApp & Electronic Communications</Typography>
                                <Typography variant="body2" color="text.secondary">By using our Service, you explicitly consent to receive communications from us via WhatsApp and other electronic channels, covering all message types including transactional, promotional, and alerts.</Typography>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Contact</Typography>
                                <Typography variant="body2" color="text.secondary">Questions about these Terms may be sent to nr@rightnxt.com or as otherwise set forth in these Terms.</Typography>
                            </Box>
                        </Stack>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        Full Terms of Use
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
