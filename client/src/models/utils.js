export const dateFormat = (dateinput) => {
  const d = new Date(dateinput);
  return d.toLocaleDateString("en-US");
};

export const customizedDateFormat = (dateinput) => {
  const date = new Date(dateinput);

  const month = date.getMonth() + 1;
  const newMonth = month > 9 ? month : `0${month}`;
  const day = date.getDate();
  const newDay = day > 9 ? day : `0${day}`;
  const formattedDateTime = `${newMonth}/${newDay}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  return formattedDateTime;
};

export const getCurrentDateTime = () => {
  const currentDate = new Date();
  const formattedDateTime = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
  return formattedDateTime;
};

export const getDistinctValues = (array, column) => {
  return [...new Set(array.map((item) => item[column]))];
};

export const getDeviceType = () => {
  const ua = navigator.userAgent;
  const width = window.innerWidth;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }

  // Fallback to screen width for more granular detection
  if (width < 768) {
    return "mobile";
  } else if (width >= 768 && width < 1024) {
    return "tablet";
  } else if (width >= 1024 && width < 1440) {
    return "laptop";
  } else {
    return "desktop";
  }
};
