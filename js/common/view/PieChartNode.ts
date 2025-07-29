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

  public constructor( slices: PieSlice[], radius: number ) {
    super();
    this.slices = slices;
    this.radius = radius;
    this.sliceEdgeCenterPoints = [];

    assert && assert( this.radius > 0, 'Pie Chart needs a non-negative radius' );
    for ( let i = 0; i < this.slices.length; i++ ) {
      assert && assert( this.slices[ i ].value >= 0, 'Pie Chart Slice needs a non-negative value' );
    }

    this.update();
  }

  public setInitialAngle( initialAngle: number ): void {
    this.initialAngle = initialAngle;
    this.update();
  }

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
      return;
    }

    let curValue = 0.0;
    this.slices.forEach( ( slice, index ) => {
      const startAngle = curValue * Math.PI * 2 / total + this.initialAngle;
      let endAngle = slice.value * Math.PI * 2 / total + startAngle;

      if ( index === this.slices.length - 1 ) {
        endAngle = Math.PI * 2 + this.initialAngle;
      }

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