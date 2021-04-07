import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'react-popover';

import ColorButton from './color-button/color-button.jsx';
import ColorPicker from '../containers/color-picker.jsx';
import InputGroup from './input-group/input-group.jsx';
import Label from './forms/label.jsx';

import GradientTypes from '../lib/gradient-types';
import ColorProptype from '../lib/color-proptype';

const ColorIndicatorComponent = props => (
    <InputGroup
        className={props.className}
        disabled={props.disabled}
    >
        <Popover
            body={
                <ColorPicker
                    color={props.color}
                    color2={props.color2}
                    colors={props.colors}
                    gradientType={props.gradientType}
                    isStrokeColor={false}
                    shouldShowGradientTools={props.shouldShowGradientTools}
                    onChangeColor={props.onChangeColor}
                    onChangeGradientType={props.onChangeGradientType}
                    onSwap={props.onSwap}
                />
            }
            isOpen={props.colorModalVisible}
            preferPlace="below"
            onOuterAction={props.onCloseColor}
        >
            <Label text={props.label}>
                <ColorButton
                    color={props.color}
                    color2={props.color2}
                    gradientType={props.gradientType}
                    onClick={props.onOpenColor}
                    outline={props.outline}
                />
            </Label>
        </Popover>
    </InputGroup>
);

ColorIndicatorComponent.propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    color: ColorProptype,
    color2: ColorProptype,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    colorModalVisible: PropTypes.bool.isRequired,
    gradientType: PropTypes.oneOf(Object.keys(GradientTypes)).isRequired,
    label: PropTypes.string.isRequired,
    onChangeColor: PropTypes.func.isRequired,
    onChangeGradientType: PropTypes.func.isRequired,
    onCloseColor: PropTypes.func.isRequired,
    onOpenColor: PropTypes.func.isRequired,
    onSwap: PropTypes.func.isRequired,
    outline: PropTypes.bool.isRequired,
    shouldShowGradientTools: PropTypes.bool.isRequired
};

export default ColorIndicatorComponent;
