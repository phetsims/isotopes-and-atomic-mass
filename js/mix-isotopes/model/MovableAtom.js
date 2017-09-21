// Copyright 2015-2017, University of Colorado Boulder

/**
 * This class represents an atom that can move around but is otherwise immutable. It was created due to a need to
 * represent atoms as single entities rather than as a collection of particles. At the time of this writing, this class
 * is used only in the Isotopes flavor of this simulation.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

define( function( require ) {
  'use strict';

  //modules
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );
  var Particle = require( 'SHRED/model/Particle' );

  // class variables
  var instanceCount = 0;

  /**
   * @param {number} numProtons
   * @param {number} numNeutrons
   * @param {Vector2} initialPosition
   * @constructor
   */
  function MovableAtom( numProtons, numNeutrons, initialPosition ) {
    Particle.call( this, 'Isotope' );
    this.positionProperty.set( initialPosition ); // @public
    this.destinationProperty.set( initialPosition ); // @public
    // @public
    this.atomConfiguration = new NumberAtom( {
      protonCount: numProtons,
      neutronCount: numNeutrons,
      electronCount: numProtons
    } );
    this.showLabel = true; // @public
    this.instanceCount = instanceCount++;
  }
  isotopesAndAtomicMass.register( 'MovableAtom', MovableAtom );
  return inherit( Particle, MovableAtom, {} );
} );

