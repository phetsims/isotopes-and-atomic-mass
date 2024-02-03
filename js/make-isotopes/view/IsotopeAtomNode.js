// Copyright 2015-2021, University of Colorado Boulder

/**
 * View representation of the atom.  Mostly, this is responsible for displaying and updating the labels, since the atom
 * itself is represented by particles, which take care of themselves in the view.  This view element also maintains
 * the electron cloud.  This is essentially identical to AtomNode of 'Build an Atom' with some reduced functionality.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Node } from '../../../../scenery/js/imports.js';
import IsotopeElectronCloudView from '../../../../shred/js/view/IsotopeElectronCloudView.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

class IsotopeAtomNode extends Node {

  /**
   * Constructor for an IsotopeAtomNode.
   *
   * @param {ParticleAtom} particleAtom Model that represents the atom, including particle positions
   * @param {Vector2} bottomPoint desired bottom point of the atom which holds the atom in position as the size changes.
   * @param {ModelViewTransform2} modelViewTransform Model-View transform
   */
  constructor( particleAtom, bottomPoint, modelViewTransform ) {

    super();

    this.atom = particleAtom;
    this.modelViewTransform = modelViewTransform;

    // Add the electron cloud.
    const isotopeElectronCloud = new IsotopeElectronCloudView( particleAtom, modelViewTransform );
    this.addChild( isotopeElectronCloud );

    // Add the handler that keeps the bottom of the atom in one place. This was added due to a request to make the atom
    // get larger and smaller but to stay on the scale.
    const updateAtomPosition = numProtons => {
      const newCenter = new Vector2( bottomPoint.x, bottomPoint.y - modelViewTransform.modelToViewDeltaX(
        isotopeElectronCloud.getElectronShellDiameter( numProtons ) / 2 ) * 1.2 ); // empirically determined
      particleAtom.positionProperty.set( modelViewTransform.viewToModelPosition( newCenter ) );
      isotopeElectronCloud.center = newCenter;
    };

    // Doesn't need unlink as it stays through out the sim life
    particleAtom.protonCountProperty.link( numProtons => {
      updateAtomPosition( numProtons );
    } );
  }
}

isotopesAndAtomicMass.register( 'IsotopeAtomNode', IsotopeAtomNode );

export default IsotopeAtomNode;