import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router-dom';
import PageContainer from '../../components/container/PageContainer';

import loginbg from '../../assets/images/login/loginbg.svg';
import mapbg from '../../assets/images/login/mapbg.svg';

import LoginLogoIcon from '../../layouts/full-layout/logo/LoginLogoIcon';

const LoginLayout = () => {
  return (
    <PageContainer>
      <Grid container spacing={0} sx={{ height: '100vh', justifyContent: 'center' }}>
        <Grid
          item
          xs={12}
          sm={12}
          lg={12}
          sx={{
            background: (theme) => `${theme.palette.mode === 'dark' ? '#1c1f25' : '#ffffff'}`,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{
              position: {
                xs: 'absolute',
                lg: 'absolute',
              },
              height: { xs: '95%' },
              right: { xs: 'auto', lg: '0' },
              margin: '0 auto',
            }}
          >
            <img
              src={loginbg}
              alt="bg"
              style={{
                width: '100%',
                maxWidth: '100%',
              }}
            />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                position: {
                  xs: 'absolute',
                  lg: 'absolute',
                },
                top: '0',
                height: { xs: 'auto', lg: '100vh' },
                margin: '0 auto',
                zIndex: 1,
              }}
            >
              <img
                src={mapbg}
                alt="bg"
                style={{
                  width: '100%',
                  maxWidth: '90%',
                }}
              />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                sx={{
                  position: {
                    xs: 'absolute',
                    lg: 'absolute',
                  },
                  width: '80%',
                }}
              >
                <Card
                  sx={{
                    width: '50%',
                  }}
                >
                  <CardContent>
                    <Outlet />
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              zIndex: 2,
            }}
          >
            <Box
              sx={{
                p: 4,
                position: 'absolute',
                top: '100',
              }}
            >
              <LoginLogoIcon />
            </Box>
          </Box>
          <Box
            sx={{
              pl: 2,
              pt: 1,
              position: 'absolute',
              bottom: '0',
              zIndex: 2,
            }}
          >
            <Typography variant="caption">
              2024 Aura Informatica Inc. All Rights Reserved.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default LoginLayout;
