// Copyright 2015-2025, University of Colorado Boulder

/**
 * View representation of the atom.  Mostly, this is responsible for displaying and updating the labels, since the atom
 * itself is represented by particles, which take care of themselves in the view.  This view element also maintains
 * the electron cloud.  This is essentially identical to AtomNode of 'Build an Atom' with some reduced functionality.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import IsotopeElectronCloudView from '../../../../shred/js/view/IsotopeElectronCloudView.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';

class IsotopeAtomNode extends Node {

  public constructor( particleAtom: ParticleAtom, bottomPoint: Vector2, modelViewTransform: ModelViewTransform2 ) {

    super();

    // Add the electron cloud.
    const isotopeElectronCloud = new IsotopeElectronCloudView( particleAtom, modelViewTransform );
    this.addChild( isotopeElectronCloud );

    // Add the handler that keeps the bottom of the atom in one place. This was added due to a request to make the atom
    // get larger and smaller but to stay on the scale.
    const updateAtomPosition = ( numProtons: number ): void => {
      const newCenter = new Vector2(
        bottomPoint.x,
        bottomPoint.y - modelViewTransform.modelToViewDeltaX(
                        isotopeElectronCloud.getElectronShellDiameter( numProtons ) / 2
                      ) * 1.2 // empirically determined
      );
      particleAtom.positionProperty.set( modelViewTransform.viewToModelPosition( newCenter ) );
      isotopeElectronCloud.center = newCenter;
    };

    // Doesn't need unlink as it stays throughout the sim life.
    particleAtom.protonCountProperty.link( ( numProtons: number ) => {
      updateAtomPosition( numProtons );
    } );
  }
}

isotopesAndAtomicMass.register( 'IsotopeAtomNode', IsotopeAtomNode );

export default IsotopeAtomNode;