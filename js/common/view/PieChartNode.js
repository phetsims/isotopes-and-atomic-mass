// Copyright 2015-2017, University of Colorado Boulder

/**
 * This node can be used to display a pie chart
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const inherit = require( 'PHET_CORE/inherit' );
  const isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  var INITIAL_ANGLE = 0;
  var DEFAULT_CENTER_X = 0;
  var DEFAULT_CENTER_Y = 0;
  /**
   *
   * @param {Array.<Object>} slices Each slice is described by object literal which looks like { value: x, color: color }
   * Values can be any amount and pie chart will size the slice based on total value of all slices
   * @param {number} radius
   * @constructor
   */
  function PieChartNode( slices, radius ) {
    Node.call( this );
    this.slices = slices;
    this.radius = radius;
    this.centerXCord = DEFAULT_CENTER_X;
    this.centerYCord = DEFAULT_CENTER_Y;
    this.initialAngle = INITIAL_ANGLE;
    this.sliceEdgeCenterPoints = []; // Useful for labeling.

    // validate the radius
    assert && assert( this.radius > 0, 'Pie Chart needs a non-negative radius' );

    // validate the slices value
    for ( var i = 0; i < this.slices.length; i++ ) {
      assert && assert( this.slices[ i ].value >= 0, 'Pie Chart Slice needs a non-negative value' );
    }

    this.update();
  }

  isotopesAndAtomicMass.register( 'PieChartNode', PieChartNode );
  return inherit( Node, PieChartNode, {

    /**
     * Set the initial angle for drawing the pie slices.  Zero (the default) means that the first slice will start at
     * the right middle. A value of PI/2 would start at the bottom of the pie.  And so on.
     *
     * @param initialAngle - In radians.
     * @public
     */
    setInitialAngle: function( initialAngle ) {
      this.initialAngle = initialAngle;
      this.update();
    },

    /**
     * Set the center for drawing the pie slices. ( 0, 0 ) is the default
     *
     * @param {number} centerX
     * @param {number} centerY
     * @public
     */
    setCenter: function( centerX, centerY ) {
      this.centerXCord = centerX;
      this.centerYCord = centerY;
      this.update();
    },

    /**
     * Set the initial angle pie slices
     *
     * @param initialAngle - In radians.
     * @param {Array.<Object>} slices Each slice is described by object literal which looks like { value: x, color: color }
     * @public
     */
    setAngleAndValues: function( initialAngle, slices ) {
      this.initialAngle = initialAngle;
      this.slices = slices;
      this.update();
    },

    /**
     * Returns the total of each slice value
     *
     * @returns {number} total
     * @public
     */
    getTotal: function() {
      var total = 0;
      this.slices.forEach( function( slice ) {
        total += slice.value;
      } );
      return total;
    },

    // @private
    update: function() {
      var self = this;
      this.removeAllChildren();
      this.sliceEdgeCenterPoints = [];

      var total = this.getTotal();

      if ( total === 0 ) {
        // if there are no values then there is no chart
        return;
      }

      // Draw each pie slice
      var curValue = 0.0;
      this.slices.forEach( function( slice, index ) {
        // Compute the start and end angles
        var startAngle = curValue * Math.PI * 2 / total + self.initialAngle;
        var endAngle = slice.value * Math.PI * 2 / total + startAngle;

        // Ensure that rounding errors do not leave a gap between the first and last slice
        if ( index === self.slices.length - 1 ) {
          endAngle = Math.PI * 2 + self.initialAngle;
        }

        // If the slice has a non-zero value, set the color and draw a filled arc.
        var shape = new Shape();
        if ( slice.value > 0 ) {
          if ( slice.value === total ) {
            var circle = new Circle( self.radius, { fill: slice.color, stroke: slice.stroke } );
            self.addChild( circle );
            circle.centerX = self.centerXCord;
            circle.centerY = self.centerYCord;
            // Assume, arbitrarily, that the center point is on the left side.
            self.sliceEdgeCenterPoints.push( new Vector2( self.centerXCord - self.radius, circle.centerY ) );
          } else {
            shape.moveTo( self.centerXCord, self.centerYCord );
            shape.arc( self.centerXCord, self.centerYCord, self.radius, startAngle, endAngle );
            shape.close();
            self.addChild( new Path( shape, { fill: slice.color, stroke: slice.stroke, lineWidth: slice.lineWidth } ) );
            var angle = startAngle + ( endAngle - startAngle ) / 2;
            self.sliceEdgeCenterPoints.push( new Vector2( Math.cos( angle ) * self.radius + self.centerXCord,
              Math.sin( angle ) * self.radius + self.centerYCord ) );
          }
        } else {
          // No slice drawn, so add null to indicate that there is no center point.
          self.sliceEdgeCenterPoints.push( null );
        }
        curValue += slice.value;
      } );
    },

    /**
     * @param {Array.<Object>} slices Each slice is described by object literal which looks like { value: x, color: color }
     * @public
     */
    setPieValues: function( slices ) {
      this.slices = slices;
      this.update();
    },

    /**
     * @param {number} radius
     * @public
     */
    setRadius: function( radius ) {
      this.radius = radius;
      this.update();
    },

    /**
     * Get the center edge point, meaning the point on the outside edge of the pie chart that represents the center, for
     * the specified slice.  This is useful for adding labels that are outside of the chart.
     *
     * @param {number} sliceNumber
     * @public
     */
    getCenterEdgePtForSlice: function( sliceNumber ) {
      if ( sliceNumber < this.sliceEdgeCenterPoints.length ) {
        return this.sliceEdgeCenterPoints[ sliceNumber ];
      } else {
        return null;
      }
    }
  } );
} );

