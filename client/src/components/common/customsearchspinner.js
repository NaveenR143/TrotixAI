import React from "react";

import { useSelector } from "react-redux";

import "../../assets/css/spinner.css";
import Spinner from "./Spinner";

const loaderStyles = {
  root: {
    backgroundColor: "rgba(171, 205, 239, 0.5)",
  },
};

function SearchingSpinnerComp() {
  const isSearching = useSelector((state) => state.SearchingReducer.searching);

  return (
    <>
      {isSearching ? (
        <div className="loader-wrapper" style={loaderStyles.root}>
          <Spinner></Spinner>
        </div>
      ) : null}
    </>
  );
}

export default SearchingSpinnerComp;
