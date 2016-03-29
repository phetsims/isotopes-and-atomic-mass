// Copyright 2016, University of Colorado Boulder

/**
 * A isotope layer rendered on canvas.  This exists for performance reasons.
 *
 * @author Aadish Gupta
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var shred = require( 'SHRED/shred' );

  /**
   * A particle layer rendered on canvas
   * @param {Array< particles >} isotopes that need to be rendered on the canvas
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view coordinate frames
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function IsotopeCanvasNode( isotopes, modelViewTransform, options ) {
    this.isotopes = isotopes;
    this.modelViewTransform = modelViewTransform;
    CanvasNode.call( this, options );
  }

  shred.register( 'IsotopeCanvasNode', IsotopeCanvasNode );

  return inherit( CanvasNode, IsotopeCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {
      var isotope;
      var i;
      for ( i = 0; i < this.isotopes.length; i++ ) {
        isotope = this.isotopes.get( i );
        var radius = this.modelViewTransform.modelToViewDeltaX( isotope.radius );
        var x = this.modelViewTransform.modelToViewX( isotope.positionProperty.get().x );
        var y = this.modelViewTransform.modelToViewY( isotope.positionProperty.get().y );
        context.fillStyle = isotope.color._css;
        context.strokeStyle = 'black';
        context.beginPath();
        context.arc( x , y, radius, 0, 2 * Math.PI, true );
        context.fill();
        context.stroke();
      }
    },

    setIsotopes: function( isotopes ) {
      this.isotopes = isotopes;
      this.invalidatePaint();
    },

    step: function() {
      this.invalidatePaint();
    }

  } );
} );