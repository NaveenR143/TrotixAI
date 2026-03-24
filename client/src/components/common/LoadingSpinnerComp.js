import React from "react";

import { useSelector } from "react-redux";

import "../../assets/css/loadingspinner.css";

const loaderStyles = {
  root: {
    backgroundColor: "rgba(171, 205, 239, 0.5)",
  },
};

function LoadingSpinnerComp() {
  const isLoading = useSelector((state) => state.SpinnerReducer.loading);

  return (
    <>
      {isLoading ? (
        <div className="spinner-wrapper" style={loaderStyles.root}>
          <div className="loader" />
        </div>
      ) : null}
    </>
  );
}

export default LoadingSpinnerComp;
