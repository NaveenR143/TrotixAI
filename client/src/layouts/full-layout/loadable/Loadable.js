import React, { Suspense } from 'react';
import Spinner from '../../../components/common/Spinner';

// project imports


// ===========================|| LOADABLE - LAZY LOADING ||=========================== //

const Loadable = (Component) => (props) =>
  (
    <Suspense fallback={<Spinner />}>
      <Component {...props} />
    </Suspense>
  );

export default Loadable;
