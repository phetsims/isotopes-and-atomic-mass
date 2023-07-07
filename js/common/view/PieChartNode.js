// Copyright 2015-2022, University of Colorado Boulder

/**
 * This node can be used to display a pie chart
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Circle, Node, Path } from '../../../../scenery/js/imports.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

// constants
const INITIAL_ANGLE = 0;
const DEFAULT_CENTER_X = 0;
const DEFAULT_CENTER_Y = 0;

class PieChartNode extends Node {

  /**
   * @param {Array.<Object>} slices Each slice is described by object literal which looks like { value: x, color: color }
   * Values can be any amount and pie chart will size the slice based on total value of all slices
   * @param {number} radius
   */
  constructor( slices, radius ) {
    super();
    this.slices = slices;
    this.radius = radius;
    this.centerXCord = DEFAULT_CENTER_X;
    this.centerYCord = DEFAULT_CENTER_Y;
    this.initialAngle = INITIAL_ANGLE;
    this.sliceEdgeCenterPoints = []; // Useful for labeling.

    // validate the radius
    assert && assert( this.radius > 0, 'Pie Chart needs a non-negative radius' );

    // validate the slices value
    for ( let i = 0; i < this.slices.length; i++ ) {
      assert && assert( this.slices[ i ].value >= 0, 'Pie Chart Slice needs a non-negative value' );
    }

    this.update();
  }

  /**
   * Set the initial angle for drawing the pie slices.  Zero (the default) means that the first slice will start at
   * the right middle. A value of PI/2 would start at the bottom of the pie.  And so on.
   *
   * @param initialAngle - In radians.
   * @public
   */
  setInitialAngle( initialAngle ) {
    this.initialAngle = initialAngle;
    this.update();
  }

  /**
   * Set the center for drawing the pie slices. ( 0, 0 ) is the default
   *
   * @param {number} centerX
   * @param {number} centerY
   * @public
   */
  setCenter( centerX, centerY ) {
    this.centerXCord = centerX;
    this.centerYCord = centerY;
    this.update();
  }

  /**
   * Set the initial angle pie slices
   *
   * @param initialAngle - In radians.
   * @param {Array.<Object>} slices Each slice is described by object literal which looks like { value: x, color: color }
   * @public
   */
  setAngleAndValues( initialAngle, slices ) {
    this.initialAngle = initialAngle;
    this.slices = slices;
    this.update();
  }

  /**
   * Returns the total of each slice value
   *
   * @returns {number} total
   * @public
   */
  getTotal() {
    let total = 0;
    this.slices.forEach( slice => {
      total += slice.value;
    } );
    return total;
  }

  // @private
  update() {
    this.removeAllChildren();
    this.sliceEdgeCenterPoints = [];

    const total = this.getTotal();

    if ( total === 0 ) {
      // if there are no values then there is no chart
      return;
    }

    // Draw each pie slice
    let curValue = 0.0;
    this.slices.forEach( ( slice, index ) => {
      // Compute the start and end angles
      const startAngle = curValue * Math.PI * 2 / total + this.initialAngle;
      let endAngle = slice.value * Math.PI * 2 / total + startAngle;

      // Ensure that rounding errors do not leave a gap between the first and last slice
      if ( index === this.slices.length - 1 ) {
        endAngle = Math.PI * 2 + this.initialAngle;
      }

      // If the slice has a non-zero value, set the color and draw a filled arc.
      const shape = new Shape();
      if ( slice.value > 0 ) {
        if ( slice.value === total ) {
          const circle = new Circle( this.radius, { fill: slice.color, stroke: slice.stroke } );
          this.addChild( circle );
          circle.centerX = this.centerXCord;
          circle.centerY = this.centerYCord;
          // Assume, arbitrarily, that the center point is on the left side.
          this.sliceEdgeCenterPoints.push( new Vector2( this.centerXCord - this.radius, circle.centerY ) );
        }
        else {
          shape.moveTo( this.centerXCord, this.centerYCord );
          shape.arc( this.centerXCord, this.centerYCord, this.radius, startAngle, endAngle );
          shape.close();
          this.addChild( new Path( shape, { fill: slice.color, stroke: slice.stroke, lineWidth: slice.lineWidth } ) );
          const angle = startAngle + ( endAngle - startAngle ) / 2;
          this.sliceEdgeCenterPoints.push( new Vector2( Math.cos( angle ) * this.radius + this.centerXCord,
            Math.sin( angle ) * this.radius + this.centerYCord ) );
        }
      }
      else {
        // No slice drawn, so add null to indicate that there is no center point.
        this.sliceEdgeCenterPoints.push( null );
      }
      curValue += slice.value;
    } );
  }

  /**
   * @param {Array.<Object>} slices Each slice is described by object literal which looks like { value: x, color: color }
   * @public
   */
  setPieValues( slices ) {
    this.slices = slices;
    this.update();
  }

  /**
   * @param {number} radius
   * @public
   */
  setRadius( radius ) {
    this.radius = radius;
    this.update();
  }

  /**
   * Get the center edge point, meaning the point on the outside edge of the pie chart that represents the center, for
   * the specified slice.  This is useful for adding labels that are outside of the chart.
   *
   * @param {number} sliceNumber
   * @public
   */
  getCenterEdgePtForSlice( sliceNumber ) {
    if ( sliceNumber < this.sliceEdgeCenterPoints.length ) {
      return this.sliceEdgeCenterPoints[ sliceNumber ];
    }
    else {
      return null;
    }
  }
}

isotopesAndAtomicMass.register( 'PieChartNode', PieChartNode );
export default PieChartNode;