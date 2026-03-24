import React from 'react';
import { useNavigate,useLocation } from 'react-router';

const withRouter = (Component) => {
    const Wrapper = (props) => {
        const history = useNavigate();
        const location = useLocation();
        return <Component history={history}  location={location} {...props} />
    }
    return Wrapper;
}

export default withRouter;