import React from 'react';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Box,
  Drawer,
  useMediaQuery,
  List,
  Typography,
  ListItem,
  Collapse,
  ListItemIcon,
  ListItemText,
  IconButton,
  Grid
} from '@mui/material';
import FeatherIcon from 'feather-icons-react';
import Icon from '@mui/material/Icon';
import { SidebarWidth } from '../../../assets/global/Theme-variable';
import Menuitems from './Menuitems';
import Scrollbar from '../../../components/common/Scrollbar';


// const CustomIcon = ({ name, ...rest }) => {
//   const IconComponent = MuiIcons[name];
//   return IconComponent ? <IconComponent {...rest} /> : null;
// };

const Sidebar = ({ isMobileSidebarOpen, onSidebarClose, isSidebarOpen, toggleSidebar, toggleMobileSidebar }) => {
  const [open, setOpen] = React.useState(true);
  const { pathname } = useLocation();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  const handleClick = (index) => {
    if (open === index) {
      setOpen((prevopen) => !prevopen);
    } else {
      setOpen(index);
    }
  };



  const SidebarContent = (
    <Scrollbar style={{ height: 'calc(100vh - 5px)' }}>
      <Box sx={{ p: 2 }}>
        <Box>

          <List>
            {Menuitems.map((item, index) => {
              // {/********SubHeader**********/}
              if (item.subheader) {
                return (
                  <li key={item.subheader} style={{ marginBottom: 10}}>

                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid>
                        <Typography
                          variant="subtitle2"
                          fontWeight="500"
                          sx={{ mt: 0, opacity: '0.4' }}
                        >
                          {item.subheader}

                        </Typography>
                      </Grid>
                      <Grid>
                        <IconButton
                          edge="start"
                          color="inherit"
                          aria-label="menu"
                          onClick={toggleSidebar}
                          size="small"
                          sx={{
                            display: {
                              lg: 'flex',
                              xs: 'none',
                            },
                            opacity: '0.4'
                          }}
                        >
                          <FeatherIcon icon="menu" />
                        </IconButton>

                        <IconButton
                          size="medium"
                          color="inherit"
                          aria-label="menu"
                          onClick={toggleMobileSidebar}
                          sx={{
                            display: {
                              lg: 'none',
                              xs: 'flex',
                            },
                            opacity: '0.4'
                          }}
                        >
                          <FeatherIcon icon="menu" width="18" height="18" />
                        </IconButton>
                      </Grid>
                    </Grid>


                  </li>
                );
                // {/********If Sub Menu**********/}
                /* eslint no-else-return: "off" */
              } else if (item.children) {
                return (
                  <React.Fragment key={item.title}>
                    <ListItem
                      button
                      component="li"
                      onClick={() => handleClick(index)}
                      selected={pathWithoutLastPart === item.href}
                      sx={{
                        mb: 1,
                        ...(pathWithoutLastPart === item.href && {
                          color: 'white',
                          backgroundColor: (theme) => `${theme.palette.primary.main}!important`,
                        }),
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ...(pathWithoutLastPart === item.href && {
                            color: 'white',
                          }),
                        }}
                      >
                        {/* <FeatherIcon icon={item.icon} width="18" height="18" /> */}
                        <Icon width="18" height="18" >{item.icon}</Icon>
                      </ListItemIcon>
                      <ListItemText>{item.title}</ListItemText>
                      {index === open || pathWithoutLastPart === item.href ? (
                        <FeatherIcon icon="chevron-down" size="16" />

                      ) : (
                        <FeatherIcon icon="chevron-right" size="16" />
                      )}
                    </ListItem>
                    <Collapse in={index === open} timeout="auto" unmountOnExit>
                      <List component="li" disablePadding>
                        {item.children.map((child) => {
                          return (
                            <ListItem
                              key={child.title}
                              button
                              component={NavLink}
                              to={child.href}
                              onClick={onSidebarClose}
                              selected={pathDirect === child.href}
                              sx={{
                                mb: 1,
                                ...(pathDirect === child.href && {
                                  color: 'primary.main',
                                  backgroundColor: 'transparent!important',
                                }),
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  svg: { width: '14px', marginLeft: '3px' },
                                  ...(pathDirect === child.href && {
                                    color: 'primary.main',
                                  }),
                                }}
                              >
                                {/* <FeatherIcon icon={child.icon} width="18" height="18" /> */}
                                <Icon width="18" height="18" >{child.icon}</Icon>
                              </ListItemIcon>
                              <ListItemText>{child.title}</ListItemText>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                  </React.Fragment>
                );
                // {/********If Sub No Menu**********/}
              } else {
                return (
                  <List component="li" disablePadding key={item.title}>
                    <ListItem
                      onClick={() => handleClick(index)}
                      button
                      component={NavLink}
                      to={item.href}
                      selected={pathDirect === item.href}
                      sx={{
                        mb: 1,
                        ...(pathDirect === item.href && {
                          color: 'white',
                          backgroundColor: (theme) => `${theme.palette.primary.main}!important`,
                        }),
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ...(pathDirect === item.href && { color: 'white' }),
                        }}
                      >
                        {/* <FeatherIcon icon={item.icon} width="18" height="18" /> */}
                        <Icon width="18" height="18" >{item.icon}</Icon>
                      </ListItemIcon>
                      <ListItemText onClick={onSidebarClose}>{item.title}</ListItemText>
                    </ListItem>
                  </List>
                );
              }
            })}
          </List>
        </Box>
      </Box>
    </Scrollbar>
  );
  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open={isSidebarOpen}
        variant="persistent"
        PaperProps={{
          sx: {
            width: SidebarWidth,
            top: lgUp ? '44px' : '0px',
            left: lgUp ? '' : '',
            borderRadius: lgUp ? '9px' : '0',
            border: '0',
            height: 'calc(100vh - 130px)',
            boxShadow: '0px 7px 30px 0px rgb(90 114 123 / 11%)'
          },
        }}
      >
        {SidebarContent}
      </Drawer>
    );
  }
  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      PaperProps={{
        sx: {
          width: SidebarWidth,
          border: '0 !important',
        },
      }}
      variant="temporary"
    >
      {SidebarContent}
    </Drawer>
  );
};

Sidebar.propTypes = {
  isMobileSidebarOpen: PropTypes.bool,
  onSidebarClose: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
};

export default Sidebar;
