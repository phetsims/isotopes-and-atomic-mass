/* Copyright 2002-2015, University of Colorado */

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

 //TODO fix indentation
 // TODO port SphericalParticle

define( function( require ) {
    'use strict';

    //modules
    var inherit = require( 'PHET_CORE/inherit' );

    function MovableAtom( numProtons, numNeutrons, radius, initialPosition ) {
        this.atomConfiguration = new NumberAtom( 0, 0, 0 );
        this.radius = radius;


    };

    return inherit( Particle, MovableAtom, {

    } );

} );
