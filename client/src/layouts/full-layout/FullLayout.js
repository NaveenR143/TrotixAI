import { Box, Container, experimentalStyled, useMediaQuery } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopbarHeight } from '../../assets/global/Theme-variable';
import Sidebar from './sidebar/Sidebar';
import SidebarCollapsed from './sidebar/SidebarCollapsed';
import Header from './header/Header';

const MainWrapper = experimentalStyled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  overflow: 'hidden',
  width: '100%',
}));
const PageWrapper = experimentalStyled('div')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  overflow: 'hidden',

  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.up('lg')]: {
    paddingTop: TopbarHeight,
  },
  [theme.breakpoints.down('lg')]: {
    paddingTop: '64px',
  },
}));

const FullLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(true);
  const customizer = useSelector((state) => state.CustomizerReducer);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));

  const token = useSelector((state) => state.UserReducer.token);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {


      navigate('/', { replace: true });
    }
  }, [])

  return (
    <MainWrapper className={customizer.activeMode === 'dark' ? 'darkbg' : ''}>
      <Header
        sx={{
          paddingLeft: isSidebarOpen && lgUp ? '0' : '',
          backgroundColor: customizer.activeMode === 'dark' ? '#20232a' : '#ffffff',
          boxShadow: '0px 7px 30px 0px rgb(90 114 123 / 11%)'
        }}
      // toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
      // toggleMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      <PageWrapper>
        <Container
          maxWidth={false}
          sx={{
            padding: '0 !important'
            // paddingTop: '20px',
            // paddingLeft: isSidebarOpen && lgUp ? '310px!important' : '',
          }}
        >
          <Box sx={{ minHeight: 'calc(100vh - 170px)' }}>
            <Outlet />
          </Box>
          {/* <Customizer /> */}
          {/* <Footer /> */}
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
};

export default FullLayout;
