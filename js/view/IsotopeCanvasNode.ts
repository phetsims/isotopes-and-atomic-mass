// Copyright 2016-2025, University of Colorado Boulder

/**
 * A isotope layer rendered on canvas.  This exists for performance reasons.
 *
 * @author Aadish Gupta
 */

import { ObservableArray } from '../../../axon/js/createObservableArray.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import CanvasNode, { CanvasNodeOptions } from '../../../scenery/js/nodes/CanvasNode.js';
import shred from '../shred.js';

// TODO: See https://github.com/phetsims/build-an-atom/issues/241.  Why is IsotopeCanvasNode.ts in the shred repo?  It
//       is only used in isotopes-and-atomic-mass and is not shared with any other sim, and it appears to depend
//       type-wise on some IAAM-specific code, hence the definition for MovableAtom below.  It should probably be moved
//       to isotopes-and-atomic-mass.
type MovableAtom = {
  radius:number;
  positionProperty: TReadOnlyProperty<Vector2>;
};

type IsotopeCanvasNodeOptions = CanvasNodeOptions;

class IsotopeCanvasNode extends CanvasNode {
  private isotopes: ObservableArray<MovableAtom>;
  private readonly modelViewTransform: ModelViewTransform2;

  /**
   * A particle layer rendered on canvas
   * @param isotopes - that need to be rendered on the canvas
   * @param modelViewTransform - to convert between model and view coordinate frames
   * @param options - that can be passed on to the underlying node
   */
  public constructor( isotopes: ObservableArray<MovableAtom>, modelViewTransform: ModelViewTransform2, options?: IsotopeCanvasNodeOptions ) {
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
    const numIsotopes = this.isotopes.length;
    if ( numIsotopes > 0 ) {

      // only calculate the radius once to save time, assumes they are all the same
      const radius = this.modelViewTransform.modelToViewDeltaX( this.isotopes.get( 0 ).radius );
      context.strokeStyle = 'black';

      for ( i = 0; i < this.isotopes.length; i++ ) {
        isotope = this.isotopes.get( i );
        const position = isotope.positionProperty.get();
        const x = this.modelViewTransform.modelToViewX( position.x );
        const y = this.modelViewTransform.modelToViewY( position.y );
        // @ts-expect-error - Seems like some work needs to be done here when Isotopes And Atomic Mass is converted to TypeScript
        context.fillStyle = isotope.color.toCSS();
        context.beginPath();
        context.arc( x, y, radius, 0, 2 * Math.PI, true );
        context.fill();
        context.stroke();
      }
    }
  }

  public setIsotopes( isotopes: ObservableArray<MovableAtom> ): void {
    this.isotopes = isotopes;
    this.invalidatePaint();
  }

  public step(): void {
    this.invalidatePaint();
  }
}

shred.register( 'IsotopeCanvasNode', IsotopeCanvasNode );
export default IsotopeCanvasNode;