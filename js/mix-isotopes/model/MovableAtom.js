// Copyright 2015, University of Colorado Boulder

/**
 * This class represents an atom that can move around but is otherwise
 * immutable.  It was created due to a need to represent atoms as single
 * entities rather than as a collection of particles.
 * At the time of this writing, this class is used only in the Isotopes flavor
 * of this simulation.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

define( function( require ) {
  'use strict';

  //modules
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Particle = require( 'SHRED/model/Particle' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );

  // class variables
  var instanceCount = 0;

  function MovableAtom( numProtons, numNeutrons, initialPosition ) {
    Particle.call( this, 'Isotope' );
    this.position = initialPosition;
    this.destination = initialPosition;
    this.atomConfiguration = new NumberAtom( { protonCount: numProtons, neutronCount: numNeutrons, electronCount: numProtons } );

    this.instanceCount = instanceCount++;


  }
  isotopesAndAtomicMass.register( 'MovableAtom', MovableAtom );
  return inherit( Particle, MovableAtom, {

  } );

} );
