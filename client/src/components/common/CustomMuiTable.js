import React, { useState } from 'react';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import typography from '../../assets/global/Typography';

import { useAuth } from '../../authContext';
import SignIn from './SignIn';
import Signup from './SignUp';

/**
 * Common MuiTable Theme configuration.
 * Consolidates styling for a modern, clean look across all data tables.
 */
const fnMuiTableTheme = (theme) =>
    createTheme({
        ...theme,
        components: {
            MUIDataTable: {
                styleOverrides: {
                    root: {
                        boxShadow: 'none !important',
                        backgroundColor: 'transparent',
                    },
                    paper: {
                        boxShadow: 'none !important',
                        borderRadius: '8px',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }
                }
            },
            MuiToolbar: {
                styleOverrides: {
                    root: {
                        minHeight: '48px !important',
                        paddingLeft: '16px !important',
                        paddingRight: '8px !important',
                    },
                },
            },
            MUIDataTableHeadCell: {
                styleOverrides: {
                    root: {
                        whiteSpace: "normal !important",
                        wordBreak: "normal",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        backgroundColor: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.common.white, 0.05)
                            : alpha(theme.palette.common.black, 0.02),
                        color: theme.palette.text.primary,
                        paddingTop: 12,
                        paddingBottom: 12,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        '& .MuiButton-root': {
                            textAlign: 'left',
                            whiteSpace: 'normal',
                        },
                        '& .MuiTableSortLabel-root': {
                            whiteSpace: 'normal',
                        }
                    },
                    data: {
                        whiteSpace: "normal !important",
                    },
                    toolButton: {
                        whiteSpace: "normal !important",
                        textAlign: "left",
                    }
                },
            },
            MUIDataTableBodyCell: {
                styleOverrides: {
                    root: {
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        fontSize: "0.85rem",
                        paddingTop: 8,
                        paddingBottom: 8,
                        color: theme.palette.text.secondary,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    root: {
                        "&:nth-of-type(odd)": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.01),
                        },
                        "&:hover": {
                            backgroundColor: `${alpha(theme.palette.primary.main, 0.04)} !important`,
                        },
                    },
                },
            },
            MUIDataTablePagination: {
                styleOverrides: {
                    root: {
                        borderTop: `1px solid ${theme.palette.divider}`,
                    }
                }
            }
        },
    });

/**
 * CustomMuiTable - A reusable wrapper for MUIDataTable with integrated theme.
 * 
 * @param {Object} props - Standard MUIDataTable props (title, data, columns, options)
 */
const CustomMuiTable = (props) => {
    // We can use the theme from the context or a default one
    const defaultTheme = createTheme();
    const { user } = useAuth();

    const [openLogin, setOpenLogin] = useState(false);
    const [opensignup, setOpenSignup] = useState(false);

    // Clone options and add onDownload restriction
    const customOptions = {
        ...props.options,
        onDownload: (buildHead, buildBody, columns, data) => {
            if (!user) {
                // If user is not signed in, prevent download
                // and show login dialog
                setOpenLogin(true);
                return false;
            }
            // If user is signed in, allow download using the default logic
            // (MUIDataTable will proceed with default download if onDownload returns true 
            // or if it handles it itself)
            if (props.options && typeof props.options.onDownload === 'function') {
                return props.options.onDownload(buildHead, buildBody, columns, data);
            }
            return true;
        }
    };

    return (
        <ThemeProvider theme={(outerTheme) => fnMuiTableTheme(outerTheme || defaultTheme)}>
            <MUIDataTable {...props} options={customOptions} />
            <SignIn
                open={openLogin}
                onClose={() => setOpenLogin(false)}
                openSignUp={() => setOpenSignup(true)}
            />
            <Signup open={opensignup} onClose={() => setOpenSignup(false)} />
        </ThemeProvider>
    );
};

export default CustomMuiTable;
