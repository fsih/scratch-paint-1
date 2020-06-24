import parseColor from 'parse-color';

const ROW_1_COLORS = {
    RED: '#ff0000',
    ORANGE: '#fd8c2f',
    YELLOW: '#fed91e',
    GREEN: '#4be05e',
    LIGHT_BLUE: '#80dbff',
    BLUE: '#3364ff',
    PURPLE: '#9966ff'
};

const ROW_2_COLORS = {
    BLACK: '#000000',
    WHITE: '#ffffff',
    UMBER: '#4c392b',
    CHOCOLATE: '#755135',
    BROWN: '#b5875c',
    TAN: '#edc393',
    PEACH: '#f7dcc3'
};

const _getColors = function (colorEnum) {
    const keys = [];
    for (const key in colorEnum) {
        if (colorEnum.hasOwnProperty(key)) keys.push(key);
    }
    return keys;
};

const getRow1Colors = function () {
    return _getColors(ROW_1_COLORS);
};

const getRow2Colors = function () {
    return _getColors(ROW_2_COLORS);
};

const getColorName = function (key) {
    return key.toLowerCase().replace('_', ' ');
};

const getColorHex = function (key) {
    return ROW_1_COLORS[key] ? ROW_1_COLORS[key] : ROW_2_COLORS[key];
};

const colorStringToHsv = hexString => {
    const hsv = parseColor(hexString).hsv;
    if (!hsv) return hsv; // transparent
    // Hue comes out in [0, 360], limit to [0, 100]
    hsv[0] = hsv[0] / 3.6;
    // Black is parsed as {0, 0, 0}, but turn saturation up to 100
    // to make it easier to see slider values.
    if (hsv[1] === 0 && hsv[2] === 0) {
        hsv[1] = 100;
    }
    return hsv;
};

const hsvToHex = (h, s, v) =>
    // Scale hue back up to [0, 360] from [0, 100]
    parseColor(`hsv(${3.6 * h}, ${s}, ${v})`).hex
;

export {
    getRow1Colors,
    getRow2Colors,
    getColorHex,
    getColorName,
    colorStringToHsv,
    hsvToHex
};
