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

    // The size of the electron cloud depends on the number of electrons.  The following listener monitors the size of
    // the electron cloud and adjusts the position of the atom so that the bottom of the atom sits on the scale. This
    // does not need to be unlinked since it exists for the life of the sim.
    isotopeElectronCloud.localBoundsProperty.link( () => {
      isotopeElectronCloud.centerX = bottomPoint.x;
      isotopeElectronCloud.bottom = bottomPoint.y;
      particleAtom.positionProperty.set( modelViewTransform.viewToModelPosition( isotopeElectronCloud.center ) );
    } );
  }
}

isotopesAndAtomicMass.register( 'IsotopeAtomNode', IsotopeAtomNode );

export default IsotopeAtomNode;