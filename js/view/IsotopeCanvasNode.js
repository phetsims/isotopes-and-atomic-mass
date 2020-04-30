// Copyright 2016-2020, University of Colorado Boulder

/**
 * A isotope layer rendered on canvas.  This exists for performance reasons.
 *
 * @author Aadish Gupta
 */

import inherit from '../../../phet-core/js/inherit.js';
import CanvasNode from '../../../scenery/js/nodes/CanvasNode.js';
import shred from '../shred.js';

/**
 * A particle layer rendered on canvas
 * @param {Array< movableAtom >} isotopes that need to be rendered on the canvas
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

inherit( CanvasNode, IsotopeCanvasNode, {

  /**
   * Paints the particles on the canvas node.
   * @param {CanvasRenderingContext2D} context
   */
  paintCanvas: function( context ) {
    let isotope;
    let i;
    const numIsotopes = this.isotopes.length;
    if ( numIsotopes > 0 ) {

      // only calculate the radius once to save time, assumes they are all the same
      const radius = this.modelViewTransform.modelToViewDeltaX( this.isotopes.get( 0 ).radiusProperty.get() );
      context.strokeStyle = 'black';

      for ( i = 0; i < this.isotopes.length; i++ ) {
        isotope = this.isotopes.get( i );
        const position = isotope.positionProperty.get();
        const x = this.modelViewTransform.modelToViewX( position.x );
        const y = this.modelViewTransform.modelToViewY( position.y );
        context.fillStyle = isotope.color.toCSS();
        context.beginPath();
        context.arc( x, y, radius, 0, 2 * Math.PI, true );
        context.fill();
        context.stroke();
      }
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

export default IsotopeCanvasNode;