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
            title: "1. Eligibility",
            content: "You must:",
            list: [
                "Be at least 18 years old",
                "Have legal capacity to enter into a binding agreement",
                "Not be prohibited from using the Service under U.S. law"
            ],
            footer: "If you use the Service on behalf of a company, you represent that you have authority to bind that entity."
        },
        {
            title: "2. Nature of the Service",
            content: "OilGasGPT is an AI-powered, map-based informational platform providing analysis and visualization of U.S. midstream energy infrastructure, including but not limited to pipelines, processing plants, power plants, terminals, and other facilities.",
            footer: "The Service is provided for informational purposes only. It is not an operational control system, engineering tool, or regulatory reporting system."
        },
        {
            title: "3. Beta Status",
            content: "The Service is currently offered as a beta product. Features may change, data may be experimental, and uptime is not guaranteed.",
            footer: "Use of beta features is at your sole risk."
        },
        {
            title: "4. Accounts, Registration & Termination",
            content: "Features may require registration. You are responsible for account security and accurate info. We may suspend or terminate:",
            list: [
                "Free accounts at any time without notice",
                "Paid accounts for breach or non-payment",
                "Accounts engaged in scraping, large-scale data extraction, or misuse"
            ],
            footer: "Termination does not relieve payment obligations already incurred."
        },
        {
            title: "5. License & Tiered Usage Rights",
            content: "We grant a limited, revocable license for internal business analysis. Access rights differ by subscription level:",
            list: [
                "Paid subscriptions grant expanded internal usage rights",
                "No tier grants rights to redistribute datasets or create derivative products",
                "No tier grants rights to train external AI systems on bulk exports",
                "No tier grants rights to provide data to third parties as a service"
            ],
            footer: "Enterprise customers may be subject to a separate written agreement."
        },
        {
            title: "6. Free and Paid Services",
            content: "OilGasGPT offers both free (“Free Tier”) and paid subscription services (“Paid Tier”).",
            subSections: [
                {
                    title: "(a) Free Tier",
                    content: "Includes limited queries, map access, and downloads. May be modified or discontinued at any time without notice."
                },
                {
                    title: "(b) Paid Subscriptions",
                    content: "Require fees and may auto-renew. Usage limits apply. Details are presented at checkout."
                },
                {
                    title: "(c) Billing & Payments",
                    content: "Processed via third parties. You authorize us to charge your method and collect applicable taxes (including U.S. sales tax)."
                },
                {
                    title: "(d) No Refund Policy",
                    content: "Fees are non-refundable. You may cancel at any time, but access continues until the end of the billing cycle."
                }
            ]
        },
        {
            title: "7. Usage Monitoring",
            content: "We reserve the right to monitor usage patterns, enforce download limits, restrict excessive automated queries, and prevent abuse of AI systems.",
            footer: "We may implement rate limiting or usage caps at any time."
        },
        {
            title: "8. AI-Generated Content Disclaimer",
            content: "Outputs from Microsoft Azure OpenAI Service may be inaccurate, incomplete, or contain hallucinations. They are probabilistic and not verified by human analysts.",
            footer: "Reliance is strictly at your own risk. Use does not imply endorsement by Microsoft or OpenAI."
        },
        {
            title: "9. Data Sources & Accuracy",
            content: "Data comes from public sources and modeling. We do not warrant accuracy, timeliness, or completeness.",
            footer: "Infrastructure connections and flows may be modeled representations."
        },
        {
            title: "10. Downloaded Data Restrictions",
            content: "Datasets are licensed, not sold. Internal analysis only. You may not:",
            list: [
                "Redistribute datasets or publish bulk data publicly",
                "Incorporate data into commercial products",
                "Train AI models on downloads without written consent"
            ]
        },
        {
            title: "11. Acceptable Use",
            content: "You agree not to violate laws, use the Service for sanctioned entities, attempt unauthorized access, conduct scraping, or misrepresent AI outputs as official records."
        }
    ];

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Card elevation={3}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        TERMS OF USE
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" align="center" gutterBottom sx={{ mb: 4 }}>
                        Effective Date: February 14, 2026
                    </Typography>

                    <Box sx={{ my: 4 }}>
                        <Typography variant="body1" paragraph>
                            These Terms of Use (“Terms”) govern your access to and use of <Link href="https://www.oilgasgpt.com" target="_blank" rel="noopener">https://www.oilgasgpt.com</Link> and all related services, software, AI systems, downloads, maps, datasets, and content (collectively, the “Service”) operated by OilGasGPT (“Company,” “we,” “us,” or “our”).
                        </Typography>
                        <Typography variant="body1" paragraph>
                            By accessing the Service, creating an account, or downloading data, you agree to be legally bound by these Terms.
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            If you do not agree, you may not use the Service.
                        </Typography>
                    </Box>

                    <Stack spacing={4} divider={<Divider />}>
                        {sections.map((section, index) => (
                            <Box key={index}>
                                <Typography variant="h5" component="h2" gutterBottom color="primary">
                                    {section.title}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {section.content}
                                </Typography>
                                {section.subSections && (
                                    <Box sx={{ mt: 2, pl: 2 }}>
                                        {section.subSections.map((sub, sidx) => (
                                            <Box key={sidx} sx={{ mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {sub.title}
                                                </Typography>
                                                <Typography variant="body2">
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
                                                <ListItemText primary={item} />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontStyle: section.footer?.includes('Disclaimer') ? 'italic' : 'normal' }}>
                                    {section.footer}
                                </Typography>
                            </Box>
                        ))}

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                12. Intellectual Property
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                All software, visualizations, compiled datasets, design, branding, and AI system integrations are owned by OilGasGPT. Access does not transfer ownership. Unauthorized commercial exploitation is prohibited.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                13. DMCA Compliance
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                If you believe content infringes your copyright, please send a notice to: <Link href="mailto:hello@oilgasgpt.com">hello@oilgasgpt.com</Link>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Your notice must comply with the Digital Millennium Copyright Act (17 U.S.C. §512). We may remove allegedly infringing content and terminate repeat infringers.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                14. Sanctions & Export Controls
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                You represent that:
                            </Typography>
                            <List sx={{ pl: 2 }}>
                                {[
                                    "You are not located in a U.S.-embargoed country",
                                    "You are not on any U.S. sanctions list (including OFAC lists)",
                                    "You will not use the Service in violation of export control laws"
                                ].map((item, idx) => (
                                    <ListItem key={idx} sx={{ py: 0.5, alignItems: 'flex-start' }}>
                                        <ListItemIcon sx={{ minWidth: 24, mt: 1 }}>
                                            <CircleIcon sx={{ fontSize: 8 }} />
                                        </ListItemIcon>
                                        <ListItemText primary={item} />
                                    </ListItem>
                                ))}
                            </List>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                We may restrict access to comply with international regulations.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                15. Disclaimer of Warranties
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                THE SERVICE IS PROVIDED “AS IS.”
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND ACCURACY.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                16. No Service Level Agreement (SLA)
                            </Typography>
                            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                                Unless explicitly provided in a separate Enterprise Agreement: No uptime, response time, or data availability guarantees apply. The Service is provided on a commercially reasonable efforts basis only.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                17. Limitation of Liability
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                FOR FREE TIER USERS:
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Total liability shall not exceed <strong>$50 USD</strong>.
                            </Typography>

                            <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>
                                FOR PAID TIER USERS:
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Total liability shall not exceed the total subscription fees paid in the preceding twelve (12) months.
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                IN NO EVENT SHALL OILGASGPT BE LIABLE FOR: INDIRECT DAMAGES, LOST PROFITS, BUSINESS INTERRUPTION, REGULATORY FINES, OR OPERATIONAL LOSSES.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                18. Indemnification
                            </Typography>
                            <Typography variant="body1">
                                You agree to defend, indemnify, and hold harmless OilGasGPT from any claims, damages, liabilities, and expenses arising from your use of the Service, your violation of these Terms, or your misuse of data.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                19. Binding Arbitration & Class Action Waiver
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2, color: 'error.main' }}>
                                PLEASE READ THIS SECTION CAREFULLY.
                            </Typography>
                            <Typography variant="body2">
                                Disputes shall be resolved exclusively through final and binding arbitration administered by the AAA under its Commercial Arbitration Rules. The legal seat shall be <strong>Delaware, United States</strong>. Hearings may be virtual.
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                                YOU WAIVE ANY RIGHT TO A JURY TRIAL OR TO PARTICIPATE IN CLASS ACTIONS.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                20. Governing Law
                            </Typography>
                            <Typography variant="body1" paragraph>
                                These Terms are governed by the laws of the State of <strong>Delaware, United States</strong>.
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                However, the Company is India-based, and nothing in these Terms creates a tax nexus or jurisdictional presence in any U.S. state beyond what is legally required.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                21. Modifications
                            </Typography>
                            <Typography variant="body1">
                                We may modify these Terms at any time. Continued use constitutes acceptance.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom color="primary">
                                22. Contact Information
                            </Typography>
                            <Typography variant="body1">
                                <strong>OilGasGPT</strong><br />
                                Email: <Link href="mailto:hello@oilgasgpt.com">hello@oilgasgpt.com</Link><br />
                                Website: <Link href="https://www.oilgasgpt.com/info" target="_blank" rel="noopener">https://www.oilgasgpt.com</Link>
                            </Typography>
                        </Box>

                        <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 1 }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Microsoft Attribution
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Powered in part by Microsoft Azure OpenAI Service. Microsoft and OpenAI are trademarks of their respective owners. Use does not imply endorsement or sponsorship.
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
}
