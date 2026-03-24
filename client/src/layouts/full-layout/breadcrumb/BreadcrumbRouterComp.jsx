import React, { useEffect } from 'react';

import { Breadcrumbs, Link, Typography } from '@mui/material';

import { Link as RouterLink, useLocation, useParams, useNavigate } from 'react-router-dom';

import axios from 'axios';

import withRouter from '../../../components/router/WithRouter';

import { useDispatch, useSelector } from 'react-redux';
import {
  ADD_NAVIGATION,
  REMOVE_NAVIGATION,
  RESET_NAVIGATION,
} from '../../../redux/constants/index';
import AlertNotificationComp from '../../../components/notification/AlertNotificationComp';
import { displaySpinner } from '../../../redux/spinner/Action';

function BreadcrumbRouterComp(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { navhistory } = useSelector((state) => ({
    navhistory: state.NavigationReducer.history,
  }));

  const username = useSelector((state) => state.UserReducer.username);
  const ip = useSelector((state) => state.UserReducer.ip);
  const token = useSelector((state) => state.UserReducer.token);

  const [pathname, setPathName] = React.useState('');

  const [status, setStatusBase] = React.useState({
    show: false,
    message: '',
    variant: 'error',
  });

  const fnShowErrorMessage = () => setStatusBase({ show: false, message: '', variant: 'info' });

  useEffect(() => {
    if (!navhistory.includes(props.location.pathname)) {
      dispatch({ type: ADD_NAVIGATION, payload: { history: props.location.pathname } });
    } else if (props.location.pathname !== '/aura/searchstack') {
        dispatch({ type: REMOVE_NAVIGATION, payload: { history: props.location.pathname } });
      }

    // window.onpopstate = (e) => {
    // 	e.preventDefault();
    // 	window.history.forward();
    // };

    if (props.location.pathname === '/aura/quicksearch') {
      dispatch({ type: RESET_NAVIGATION });
    }

    // console.log('url : ' + props.location.pathname);

    fnValidateUserIp(props.location.pathname);
  }, [props.location.pathname]);

  const fnValidateUserIp = (url) => {
    dispatch(displaySpinner(true));

    const userdetails = {
      username,
      ip,
      path: url,
    };

    const options = {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    };

    axios.post('/api/validateuserip', userdetails, options).then(
      (response) => {
        dispatch(displaySpinner(false));

        if (response.data[0].status === 'error') {
          setStatusBase({
            show: true,
            message: 'An error occurred during execution.',
            variant: 'error',
          });
        } else if (response.data[0].status === 'success') {
          if (response.data[0].data !== 'valid') {
            setStatusBase({
              show: true,
              message:
                'The user has already logged in from a different system. To Continue please log in again.',
              variant: 'info',
            });

            setTimeout(() => {
              navigate('/');
            }, 4000);
          }
        } else {
          navigate('/');
        }
      },
      (error) => {
        dispatch(displaySpinner(false));

        if (error.request.status === 500) {
          navigate('/');
        } else {
          setStatusBase({ show: true, message: 'Error occurred while validating the user', variant: 'error' });
        }
      },
    );
  };

  const breadcrumbNameMap = {
    // '/aura/quicksearch': 'Quick Search',
    '/aura/searchstack': 'Search Stack',
    '/aura/facilitysearch': 'Facility Search',
    '/aura/datasift': 'DataSift',
    '/aura/datafetch': 'DataFetch',
  };

  const resetProjectParams = () =>
    //dispatch({ type: actionType.RESETPROJECT_STATE_PARAMS });

    useEffect(() => {
      setPathName(props.location.pathname);
    }, []);

  const LinkRouter = (props) => <Link {...props} component={RouterLink} />;

  return (
    <React.Fragment>
      {/* {navhistory} */}
      {props.location.pathname !== '/aura/searchstack' ? (
        <Breadcrumbs aria-label="breadcrumb">
          {navhistory.length > 0 &&
            navhistory.map((value, index) => {
              const last = index === navhistory.length - 1;

              const to = value;

              if (last) {
                return (
                  <Typography color="textPrimary" key={to}>
                    {breadcrumbNameMap[to]}
                  </Typography>
                );
              } else if (index === 0) {
                return (
                  <LinkRouter
                    href={to}
                    onClick={resetProjectParams}
                    color="inherit"
                    to={to}
                    key={to}
                  >
                    {breadcrumbNameMap[to]}
                  </LinkRouter>
                );
              } else {
                return (
                  <LinkRouter href={to} color="inherit" to={to} key={to}>
                    {breadcrumbNameMap[to]}
                  </LinkRouter>
                );
              }
            })}
        </Breadcrumbs>
      ) : (
        'Search Stack'
      )}
      <AlertNotificationComp
        variant={status.variant}
        onClose={fnShowErrorMessage}
        message={status.message}
        display={status.show}
      ></AlertNotificationComp>
    </React.Fragment>
  );
}

export default withRouter(BreadcrumbRouterComp);
