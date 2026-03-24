import { useSelector } from "react-redux";
import { DEMO_USER } from "./user";

export const TableOptions = () => {
  const role = useSelector((state) => state.UserReducer.userrole);

  return {
    print: false,
    selectableRows: "none",
    resizableColumns: true,
    download: role !== DEMO_USER,
    downloadOptions: {
      filterOptions: {
        useDisplayedColumnsOnly: true,
        useDisplayedRowsOnly: true,
      },
    },
  };
};

export const PipelineTableOptions = () => {
  const role = useSelector((state) => state.UserReducer.userrole);

  return {
    print: false,
    selectableRows: "none",
    resizableColumns: true,
    download: role !== DEMO_USER,
    filterType: "multiselect",
    downloadOptions: {
      filterOptions: {
        useDisplayedColumnsOnly: true,
        useDisplayedRowsOnly: true,
      },
    },
  };
};
