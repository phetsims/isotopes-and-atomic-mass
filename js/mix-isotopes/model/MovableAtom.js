/**
 * This class represents an atom that can move around but is otherwise
 * immutable.  It was created due to a need to represent atoms as single
 * entities rather than as a collection of particles.
 * <p/>
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
    var inherit = require( 'PHET_CORE/inherit' );
    var Particle = require( 'SHRED/model/Particle' );
    var NumberAtom = require( 'SHRED/model/NumberAtom' );

    function MovableAtom( numProtons, numNeutrons, initialPosition ) {
      Particle.call( this, 'Isotope' )
        this.position = initialPosition;
        this.atomConfiguration = new NumberAtom( { protonCount: numProtons, neutronCount: numNeutrons, electronCount: numProtons } );


    }

    return inherit( Particle, MovableAtom, {

    } );

} );
