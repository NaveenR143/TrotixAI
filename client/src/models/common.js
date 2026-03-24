export const getDistinctValues = (array, column) => {
  return [...new Set(array.map((item) => item[column]))];
};
