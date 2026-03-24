import { createTheme } from '@mui/material/styles';
import typography from '../assets/global/Typography';

export const getMuiTableTheme = () => createTheme({
    components: {

        MUIDataTable: {
            styleOverrides: {
                root: {
                    boxShadow: 'none !important',
                    padding: 5
                }
            }
        },
        MuiToolbar: {
            styleOverrides: {
                root: {
                    minHeight: '40px !important'
                },
            },
        },
        MUIDataTableHead: {
            styleOverrides: {
                main: {
                    borderTop: '1px solid rgba(224, 224, 224, 1)',

                }
            }
        },
        MUIDataTableHeadCell: {
            styleOverrides: {
                fixedHeader: {
                    paddingTop: '2px',
                    paddingBottom: '2px'
                },
                data: {
                    fontSize: typography.subtitle2.fontSize,
                    fontWeight: typography.subtitle2.fontWeight,

                }
            }
        },
        MUIDataTableBodyCell: {
            styleOverrides: {
                root: {
                    fontSize: typography.body1.fontSize,
                    paddingTop: '2px',
                    paddingBottom: '2px'
                }
            }
        }
    }
})