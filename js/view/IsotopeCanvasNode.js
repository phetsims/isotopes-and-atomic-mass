// Copyright 2016, University of Colorado Boulder

/**
 * A isotope layer rendered on canvas.  This exists for performance reasons.
 *
 * @author Aadish Gupta
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   * A particle layer rendered on canvas
   * @param {Array< particles >} isotopes that need to be rendered on the canvas
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view coordinate frames
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function ParticleCanvasNode( isotopes, modelViewTransform, options ) {

    this.isotopes = isotopes;
    this.modelViewTransform = modelViewTransform;
    CanvasNode.call( this, options );
  }

  return inherit( CanvasNode, ParticleCanvasNode, {

    /**
     * Paints the particles on the canvas node.
     * @param {CanvasRenderingContext2D} context
     */
    paintCanvas: function( context ) {
      var isotope;
      var i;
      for ( i = 0; i < this.isotopes.length; i++ ) {
        isotope = this.isotopes[ i ];
        context.fillStyle = isotope.color._css;
        context.beginPath();
        context.arc( this.modelViewTransform.modelToViewX( isotope.positionProperty.get().x ),
          this.modelViewTransform.modelToViewY( isotope.positionProperty.get().y ),
          this.modelViewTransform.modelToViewDeltaX( isotope.radius ), 0, 2 * Math.PI, true );
        context.fill();
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