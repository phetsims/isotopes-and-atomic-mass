// Copyright 2015-2025, University of Colorado Boulder

/**
 * This node can be used to display a pie chart
 *
 * @author Aadish Gupta
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

const INITIAL_ANGLE = 0;
const DEFAULT_CENTER_X = 0;
const DEFAULT_CENTER_Y = 0;

export type PieSlice = {
  value: number;
  color: Color;
  stroke?: Color;
  lineWidth?: number;
};

class PieChartNode extends Node {

  public centerXCord = DEFAULT_CENTER_X;
  public centerYCord = DEFAULT_CENTER_Y;
  private slices: PieSlice[];
  private radius: number;
  private initialAngle = INITIAL_ANGLE;
  private sliceEdgeCenterPoints: Array<Vector2 | null>;

  /**
   * @param slices - Each slice has a value and a color.  Values can be any non-negative number, and the pie chart will
   *                 calculate the proportions accordingly.
   * @param radius - radius of the pie chart in screen coordinates
   */
  public constructor( slices: PieSlice[], radius: number ) {
    super();
    this.slices = slices;
    this.radius = radius;
    this.sliceEdgeCenterPoints = [];

    assert && assert( this.radius > 0, 'Pie Chart needs a positive radius' );
    for ( let i = 0; i < this.slices.length; i++ ) {
      assert && assert( this.slices[ i ].value >= 0, 'Pie Chart Slice needs a non-negative value' );
    }

    this.update();
  }

  /**
   * Set the initial angle for drawing the pie slices.  Zero (the default) means that the first slice will start at
   * the right middle. A value of PI/2 would start at the bottom of the pie.  And so on.
   * @param initialAngle - In radians.
   */
  public setInitialAngle( initialAngle: number ): void {
    this.initialAngle = initialAngle;
    this.update();
  }

  /**
   * Set the center for drawing the pie slices. ( 0, 0 ) is the default.
   */
  public override setCenter( center: Vector2 ): this {
    this.centerXCord = center.x;
    this.centerYCord = center.y;
    this.update();
    return this;
  }

  public setAngleAndValues( initialAngle: number, slices: PieSlice[] ): void {
    this.initialAngle = initialAngle;
    this.slices = slices;
    this.update();
  }

  /**
   * Get the total value of all pie slices.
   */
  public getTotal(): number {
    let total = 0;
    this.slices.forEach( slice => {
      total += slice.value;
    } );
    return total;
  }

  private update(): void {
    this.removeAllChildren();
    this.sliceEdgeCenterPoints = [];

    const total = this.getTotal();

    if ( total === 0 ) {
      // If there are no values, there is no chart.
      return;
    }

    let curValue = 0.0;
    this.slices.forEach( ( slice, index ) => {
      const startAngle = curValue * Math.PI * 2 / total + this.initialAngle;
      let endAngle = slice.value * Math.PI * 2 / total + startAngle;

      // Ensure that rounding errors do not leave a gap between the first and last slice.
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
          this.sliceEdgeCenterPoints.push( new Vector2( this.centerXCord - this.radius, circle.centerY ) );
        }
        else {
          shape.moveTo( this.centerXCord, this.centerYCord );
          shape.arc( this.centerXCord, this.centerYCord, this.radius, startAngle, endAngle );
          shape.close();
          this.addChild( new Path( shape, { fill: slice.color, stroke: slice.stroke, lineWidth: slice.lineWidth } ) );
          const angle = startAngle + ( endAngle - startAngle ) / 2;
          this.sliceEdgeCenterPoints.push( new Vector2(
            Math.cos( angle ) * this.radius + this.centerXCord,
            Math.sin( angle ) * this.radius + this.centerYCord
          ) );
        }
      }
      else {

        // No slice drawn, so add null to indicate that there is no center point.
        this.sliceEdgeCenterPoints.push( null );
      }
      curValue += slice.value;
    } );
  }

  public setPieValues( slices: PieSlice[] ): void {
    this.slices = slices;
    this.update();
  }

  public setRadius( radius: number ): void {
    this.radius = radius;
    this.update();
  }

  /**
   * Get the center edge point for the specified slide, meaning the point on the outside edge of the pie chart that
   * represents the center.  This is useful for adding labels that are outside the chart.
   */
  public getCenterEdgePtForSlice( sliceNumber: number ): Vector2 | null {
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