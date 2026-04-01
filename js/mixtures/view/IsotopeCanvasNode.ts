// Copyright 2016-2026, University of Colorado Boulder

/**
 * An isotope layer rendered on canvas.  This exists for performance reasons.
 *
 * @author Aadish Gupta
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import CanvasNode, { CanvasNodeOptions } from '../../../../scenery/js/nodes/CanvasNode.js';
import PositionableAtom from '../model/PositionableAtom.js';

type IsotopeCanvasNodeOptions = CanvasNodeOptions;

class IsotopeCanvasNode extends CanvasNode {
  private isotopes: PositionableAtom[];
  private readonly modelViewTransform: ModelViewTransform2;

  /**
   * A particle layer rendered on canvas
   * @param isotopes - that need to be rendered on the canvas
   * @param modelViewTransform - to convert between model and view coordinate frames
   * @param options - that can be passed on to the underlying node
   */
  public constructor( isotopes: PositionableAtom[],
                      modelViewTransform: ModelViewTransform2,
                      options?: IsotopeCanvasNodeOptions ) {

    super( options );
    this.isotopes = isotopes;
    this.modelViewTransform = modelViewTransform;
  }

  /**
   * Paints the particles on the canvas node.
   */
  public override paintCanvas( context: CanvasRenderingContext2D ): void {
    let isotope;
    let i;

    // Only calculate the radius once to save time, assumes they are all the same.
    const radius = this.modelViewTransform.modelToViewDeltaX( this.isotopes[ 0 ].radius );
    context.strokeStyle = 'black';

    for ( i = 0; i < this.isotopes.length; i++ ) {
      isotope = this.isotopes[ i ];

      // Skip inactive isotopes.
      if ( !isotope.isActiveProperty.value ) {
        continue;
      }

      const position = isotope.positionProperty.get();
      const x = this.modelViewTransform.modelToViewX( position.x );
      const y = this.modelViewTransform.modelToViewY( position.y );
      context.fillStyle = isotope.colorProperty.value.toCSS();
      context.beginPath();
      context.arc( x, y, radius, 0, 2 * Math.PI, true );
      context.fill();
      context.stroke();
    }
  }

  public setIsotopes( isotopes: PositionableAtom[] ): void {
    this.isotopes = isotopes;
    this.invalidatePaint();
  }

  public step(): void {
    this.invalidatePaint();
  }
}

export default IsotopeCanvasNode;
