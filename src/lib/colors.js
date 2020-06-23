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

const getColorRGB = function (key) {
    const colorValue = ROW_1_COLORS[key] ? ROW_1_COLORS[key] : ROW_2_COLORS[key];
    const rgb = parseColor(colorValue).rgb;
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
};

export {
    getRow1Colors,
    getRow2Colors,
    getColorRGB,
    getColorName
};
