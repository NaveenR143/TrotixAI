const themes = {
  defaulttheme: {
    TEXTPRIMARYCOLOR: '#636e72',
    PRIMARYCOLOR: '#74b9ff',
    SUCCESSCOLOR: '#00b894',
    ERRORCOLOR: '#d63031',
    WARNINGCOLOR: '#e17055',
    INPROGRESSCOLOR: '#00cec9',
    BACKGROUNDCOLOR: '#0984e3',
  },
};

export function getThemeVariablesByName() {
  return themes['defaulttheme'];
}

const getRGB = () => Math.floor(Math.random() * 256);

const rgbToHex = (r, g, b) =>
  '#' +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');

export function getRandomColor() {
  const color = {
    r: getRGB(),
    g: getRGB(),
    b: getRGB(),
    a: 1,
  };

  return [rgbToHex(color.r, color.g, color.b), color];
}

export function convertHexToRGB(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
