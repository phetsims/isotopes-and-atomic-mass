// Copyright 2015-2025, University of Colorado Boulder

/**
 * This class represents an atom that can move around but is otherwise immutable. It was created due to a need to
 * represent atoms as single entities rather than as a collection of particles. At the time of this writing, this class
 * is used only in the Isotopes flavor of this simulation.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */


//modules
import optionize from '../../../../phet-core/js/optionize.js';
import Particle from '../../../../shred/js/model/Particle.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import ImmutableAtomConfig from './ImmutableAtomConfig.js';

// class variables
let instanceCount = 0;

class MovableAtom extends Particle {

  /**
   * @param {number} numProtons
   * @param {number} numNeutrons
   * @param {Vector2} initialPosition
   * @param {Object} providedOptions
   * @constructor
   */
  constructor( numProtons, numNeutrons, initialPosition, providedOptions ) {

    const options = optionize()( { // eslint-disable-line phet/bad-text
      particleRadius: 10
    }, providedOptions );

    super( 'Isotope', options );
    this.positionProperty.set( initialPosition ); // @public
    this.destinationProperty.set( initialPosition ); // @public

    // @public
    this.atomConfiguration = new ImmutableAtomConfig( numProtons, numNeutrons, numProtons );
    this.showLabel = true; // @public
    this.instanceCount = instanceCount++;
  }
}

isotopesAndAtomicMass.register( 'MovableAtom', MovableAtom );
export default MovableAtom;