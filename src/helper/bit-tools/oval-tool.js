import paper from '@scratch/paper';
import Modes from '../../lib/modes';
import {drawRotatedEllipse, drawShearedEllipse} from '../bitmap';
import {getRaster} from '../layer';
import {clearSelection} from '../selection';
import BoundingBoxTool from '../selection-tools/bounding-box-tool';
import NudgeTool from '../selection-tools/nudge-tool';

/**
 * Tool for drawing ovals.
 */
class OvalTool extends paper.Tool {
    static get TOLERANCE () {
        return 6;
    }
    /**
     * @param {function} setSelectedItems Callback to set the set of selected items in the Redux state
     * @param {function} clearSelectedItems Callback to clear the set of selected items in the Redux state
     * @param {!function} onUpdateImage A callback to call when the image visibly changes
     */
    constructor (setSelectedItems, clearSelectedItems, onUpdateImage) {
        super();
        this.setSelectedItems = setSelectedItems;
        this.clearSelectedItems = clearSelectedItems;
        this.onUpdateImage = onUpdateImage;
        this.boundingBoxTool = new BoundingBoxTool(Modes.BIT_OVAL, setSelectedItems, clearSelectedItems, onUpdateImage);
        const nudgeTool = new NudgeTool(this.boundingBoxTool, onUpdateImage);
        
        // We have to set these functions instead of just declaring them because
        // paper.js tools hook up the listeners in the setter functions.
        this.onMouseDown = this.handleMouseDown;
        this.onMouseDrag = this.handleMouseDrag;
        this.onMouseUp = this.handleMouseUp;
        this.onKeyUp = nudgeTool.onKeyUp;
        this.onKeyDown = nudgeTool.onKeyDown;

        this.oval = null;
        this.color = null;
        this.active = false;
    }
    getHitOptions () {
        return {
            segments: false,
            stroke: true,
            curves: false,
            fill: true,
            guide: false,
            match: hitResult =>
                (hitResult.item.data && hitResult.item.data.isHelperItem) ||
                    hitResult.item === this.oval, // Allow hits on bounding box and oval only
            tolerance: OvalTool.TOLERANCE / paper.view.zoom
        };
    }
    /**
     * Should be called if the selection changes to update the bounds of the bounding box.
     * @param {Array<paper.Item>} selectedItems Array of selected items.
     */
    onSelectionChanged (selectedItems) {
        this.boundingBoxTool.onSelectionChanged(selectedItems);
        if ((!this.oval || !this.oval.parent) &&
                selectedItems && selectedItems.length === 1 && selectedItems[0].shape === 'ellipse') {
            // Infer that an undo occurred and get back the active oval
            this.oval = selectedItems[0];
        }
    }
    setColor (color) {
        this.color = color;
    }
    handleMouseDown (event) {
        if (event.event.button > 0) return; // only first mouse button
        this.active = true;

        if (this.boundingBoxTool.onMouseDown(event, false /* clone */, false /* multiselect */, this.getHitOptions())) {
            this.isBoundingBoxMode = true;
        } else {
            this.isBoundingBoxMode = false;
            clearSelection(this.clearSelectedItems);
            this.commitOval();
            this.oval = new paper.Shape.Ellipse({
                fillColor: this.color,
                point: event.downPoint,
                size: 0
            });
        }
    }
    handleMouseDrag (event) {
        if (event.event.button > 0 || !this.active) return; // only first mouse button

        if (this.isBoundingBoxMode) {
            this.boundingBoxTool.onMouseDrag(event);
            return;
        }

        const downPoint = new paper.Point(event.downPoint.x, event.downPoint.y);
        const point = new paper.Point(event.point.x, event.point.y);
        if (event.modifiers.shift) {
            this.oval.size = new paper.Point(event.downPoint.x - event.point.x, event.downPoint.x - event.point.x);
        } else {
            this.oval.size = downPoint.subtract(point);
        }
        if (event.modifiers.alt) {
            this.oval.position = downPoint;
        } else {
            this.oval.position = downPoint.subtract(this.oval.size.multiply(0.5));
        }
        
    }
    handleMouseUp (event) {
        if (event.event.button > 0 || !this.active) return; // only first mouse button
        
        if (this.isBoundingBoxMode) {
            this.boundingBoxTool.onMouseUp(event);
            this.isBoundingBoxMode = null;
            return;
        }

        if (this.oval) {
            if (Math.abs(this.oval.size.width * this.oval.size.height) < OvalTool.TOLERANCE / paper.view.zoom) {
                // Tiny oval created unintentionally?
                this.oval.remove();
                this.oval = null;
            } else {
                // Hit testing does not work correctly unless the width and height are positive
                this.oval.size = new paper.Point(Math.abs(this.oval.size.width), Math.abs(this.oval.size.height));
                this.oval.selected = true;
                this.setSelectedItems();
            }
        }
        this.active = false;
    }
    /*
     * Based on paper.Matrix.decompose, but get a vertical shear instead of horizontal shear
     * and keep radians. Assumes the matrix is invertible.
     */
    _decompose (matrix) {
        const a = matrix.a;
        const b = matrix.b;
        const c = matrix.c;
        const d = matrix.d;
        const s = Math.sqrt((c * c) + (d * d));
        return {
            rotation: Math.asin(c / s) * (d > 0 ? 1 : -1),
            scaling: new paper.Point(((a * d) - (b * c)) / s, s),
            shearSlope: new paper.Point(s * s, (a * c) + (b * d))
        };
    }
    commitOval () {
        if (!this.oval || !this.oval.parent) return;

        if (!this.oval.matrix.isInvertible()) {
            this.oval.remove();
            this.oval = null;
            return;
        }

        const decomposed = this._decompose(this.oval.matrix);
        const radiusX = Math.abs(this.oval.size.width / 2);
        const radiusY = Math.abs(this.oval.size.height / 2);
        const shearSlope = -decomposed.shearSlope.y / decomposed.shearSlope.x;
        const context = getRaster().getContext('2d');
        context.fillStyle = this.color;
        if (Math.abs(Math.atan2(decomposed.shearSlope.y, decomposed.shearSlope.x)) < Math.PI / 180) {
            // Use rotation
            drawRotatedEllipse({
                centerX: this.oval.position.x,
                centerY: this.oval.position.y,
                radiusX: radiusX * decomposed.scaling.x,
                radiusY: radiusY * decomposed.scaling.y,
                rotation: decomposed.rotation,
                isFilled: true
            }, context);
        } else if (Math.abs(decomposed.rotation) < Math.PI / 180) {
            // Use shear
            drawShearedEllipse({
                centerX: this.oval.position.x,
                centerY: this.oval.position.y,
                radiusX: radiusX * decomposed.scaling.x,
                radiusY: radiusY * decomposed.scaling.y,
                shearSlope,
                isFilled: true
            }, context);
        } else {
            // Arbitrary ellipse
            const inverse = this.oval.matrix.clone().invert();

            // A, B, and C represent Ax^2 + Bxy + Cy^2 = 1 coefficients in a transformed ellipse formula
            const A = (inverse.a * inverse.a / radiusX / radiusX) + (inverse.b * inverse.b / radiusY / radiusY);
            const B = (2 * inverse.a * inverse.c / radiusX / radiusX) + (2 * inverse.b * inverse.d / radiusY / radiusY);
            const C = (inverse.c * inverse.c / radiusX / radiusX) + (inverse.d * inverse.d / radiusY / radiusY);
  
            // radiusA, radiusB, and slope are parameters of a skewed ellipse with the above formula
            const radiusB = 1 / Math.sqrt(C);
            const radiusA = Math.sqrt(-4 * C / ((B * B) - (4 * A * C)));
            const slope = B / 2 / C;

            drawShearedEllipse({
                centerX: this.oval.position.x,
                centerY: this.oval.position.y,
                radiusX: radiusA,
                radiusY: radiusB,
                shearSlope: slope,
                isFilled: true
            }, context);
        }
        this.oval.remove();
        this.oval = null;
        this.onUpdateImage();

    }
    deactivateTool () {
        this.commitOval();
        this.boundingBoxTool.removeBoundsPath();
    }
}

export default OvalTool;
