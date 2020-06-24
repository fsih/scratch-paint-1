import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import paper from '@scratch/paper';
import PropTypes from 'prop-types';
import React from 'react';

import {clearSelectedItems} from '../reducers/selected-items';
import {activateEyeDropper} from '../reducers/eye-dropper';

import SwatchesComponent from '../components/color-picker/swatches.jsx';
import {MIXED} from '../helper/style-path';
import {colorStringToHsv, getRow1Colors, getRow2Colors} from '../lib/colors';

// Important! This component ignores new color props except when isEyeDropping
// This is to make the HSV <=> RGB conversion stable. The sliders manage their
// own changes until unmounted or color changes with props.isEyeDropping = true.
class Swatches extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'colorsMatch',
            'handleSwatch',
            'handleTransparent',
            'handleActivateEyeDropper'
        ]);
    }
    colorsMatch (colorString1, colorString2) {
        // transparent or mixed
        if (!colorString1 || colorString1 === MIXED) return colorString1 === colorString2;

        const [hue1, saturation1, brightness1] = colorStringToHsv(colorString1);
        const [hue2, saturation2, brightness2] = colorStringToHsv(colorString2);
        return Math.abs(hue1 - hue2) < .5 &&
            Math.abs(saturation1 - saturation2) < .5 &&
            Math.abs(brightness1 - brightness2) < .5;
    }
    /**
     * @param{string} color - a hex color
     */
    handleSwatch (color) {
        this.props.onChangeColor(color);
    }
    handleTransparent () {
        this.props.onChangeColor(null);
    }
    handleActivateEyeDropper () {
        this.props.onActivateEyeDropper(
            paper.tool, // get the currently active tool from paper
            this.props.onChangeColor
        );
    }
    render () {
        return (
            <SwatchesComponent
                color={this.props.color}
                color2={this.props.color2}
                row1Colors={getRow1Colors()}
                row2Colors={getRow2Colors()}
                colorsMatch={this.colorsMatch}
                colorIndex={this.props.colorIndex}
                isEyeDropping={this.props.isEyeDropping}
                onActivateEyeDropper={this.handleActivateEyeDropper}
                onSwatch={this.handleSwatch}
                onTransparent={this.handleTransparent}
            />
        );
    }
}

Swatches.propTypes = {
    color: PropTypes.string,
    color2: PropTypes.string,
    colorIndex: PropTypes.number.isRequired,
    isEyeDropping: PropTypes.bool.isRequired,
    onActivateEyeDropper: PropTypes.func.isRequired,
    onChangeColor: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    colorIndex: state.scratchPaint.fillMode.colorIndex,
    isEyeDropping: state.scratchPaint.color.eyeDropper.active
});

const mapDispatchToProps = dispatch => ({
    clearSelectedItems: () => {
        dispatch(clearSelectedItems());
    },
    onActivateEyeDropper: (currentTool, callback) => {
        dispatch(activateEyeDropper(currentTool, callback));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Swatches);
