// Copyright 2002-2014, University of Colorado Boulder

/**
 * This is the primary model class for the Make Isotopes module.  This class acts as the main interface for model
 * actions, and contains the constituent model elements.  It watches all neutrons and, based on where they are placed by
 * the user, moves them between the neutron bucket and the atom. In this model, units are picometers (1E-12).
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  var Particle = require( 'SHRED/model/Particle' );
  var ParticleAtom = require( 'SHRED/model/ParticleAtom' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Color = require( 'SCENERY/util/Color' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var SharedConstants = require( 'SHRED/SharedConstants' );
  var PropertySet = require('AXON/PropertySet');


  // Strings
  var neutronsNameString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/neutrons.title' );

  //----------------------------------------------------------------------------
  // Class Data
  //----------------------------------------------------------------------------
  // Constant that defines the default number of neutrons in the bucket.
  var DEFAULT_NUM_NEUTRONS_IN_BUCKET = 4;

  // Radius of the nucleons, in screen coordinates, which are roughly pixels.
//  var NUCLEON_RADIUS = 5;

  var NUCLEUS_JUMP_PERIOD = 0.1; // In seconds

  // maximum drop distance for a nucleon to be considered part of the particle.
  var NUCLEON_CAPTURE_RADIUS = 100;

  // Constants that define the size, position, and appearance of the neutron bucket.
  var BUCKET_SIZE = new Dimension2( 130, 60 );
  var NEUTRON_BUCKET_POSITION = new Vector2( -250, -110 );

  // Speed at which neutrons move back to the bucket when released.  This value is empirically determined, adjust as
  // needed for desired look.
  var NEUTRON_MOTION_VELOCITY = 200; // In picometers per second of sim time.

  // Distance at which nucleons are captured by the nucleus.
//  var NUCLEUS_CAPTURE_DISTANCE = Atom.ELECTRON_SHELL_1_RADIUS;

  // Default atom configuration.
  var DEFAULT_ATOM_CONFIG = new NumberAtom( { protonCount: 1, neutronCount: 0, electronCount: 1 } ); // Hydrogen.

  /**
   * Constructor for a make isotopes model.  This will construct the model with atoms initially in the bucket.
   *
   * @constructor
   */
  function MakeIsotopesModel() {

    // Supertype constructor
    PropertySet.call( this, {} );

    // carry through scope
    var thisModel = this;

    // create the atom.
    this.particleAtom = new ParticleAtom();

    // Make available a 'number atom' that tracks the state of the particle atom.
    this.numberAtom = DEFAULT_ATOM_CONFIG;

    // Update the stability state and counter on changes.
    thisModel.nucleusStable = true;
    thisModel.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
    thisModel.nucleusOffset = Vector2.ZERO;
    thisModel.numberAtom.massNumberProperty.link( function( massNumber ) {
      var stable = massNumber > 0 ? AtomIdentifier.isStable( thisModel.numberAtom.protonCount, thisModel.numberAtom.neutronCount ) : true;
      if ( thisModel.nucleusStable !== stable ) {
        // Stability has changed.
        thisModel.nucleusStable = stable;
        if ( stable ) {
          thisModel.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
          thisModel.particleAtom.nucleusOffset = Vector2.ZERO;
        }
      }
    } );

    // Arrays that contain the subatomic particles, whether they are in the  bucket or in the atom.  This is part of a
    // basic assumption about how the model works, which is that the model contains all the particles, and the particles
    // move back and forth from being in the bucket or in in the atom.
    this.neutrons = [];
    this.protons = [];
    this.electrons = [];

    // The bucket that holds the neutrons that are not in the atom.
    this.neutronBucket = new SphereBucket( {
      position: NEUTRON_BUCKET_POSITION,
      size: BUCKET_SIZE,
      baseColor: Color.gray,
      caption: neutronsNameString,
      sphereRadius: SharedConstants.NUCLEON_RADIUS
    } );

    // Define a function that will decide where to put nucleons.
    var placeNucleon = function( particle, bucket, atom ) {
      if ( particle.position.distance( atom.position ) < NUCLEON_CAPTURE_RADIUS ) {
        atom.addParticle( particle );
      }
      else {
        bucket.addParticleNearestOpen( particle, true );
      }
    };

    // Add the neutrons to the neutron bucket.
    _.times( DEFAULT_NUM_NEUTRONS_IN_BUCKET, function() {
      var neutron = new Particle( 'neutron' );
      thisModel.neutrons.push( neutron );
      thisModel.neutronBucket.addParticleFirstOpen( neutron, false );
      neutron.userControlledProperty.link( function( userControlled ) {
        if ( !userControlled && !thisModel.neutronBucket.containsParticle( neutron ) ) {
          placeNucleon( neutron, thisModel.neutronBucket, thisModel.particleAtom );
        }
      } );
    } );

    this.numberAtom.massNumberProperty.link( function() {
      thisModel.setAtomConfiguration( thisModel.numberAtom );
    });

    // Set the initial atom configuration.
    this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );

  }

  return inherit( PropertySet, MakeIsotopesModel, {

    // Main model step function, called by the framework.
    step: function( dt ) {

      // Update particle positions.
      this.neutrons.forEach( function( neutron ) {
        neutron.step( dt );
      } );
    },

    /**
     * Get the current atom of this model, in its number representation
     *
     * @returns {NumberAtom}
     */
    getNumberAtom: function() {
      return this.numberAtom;
    },

    /**
     * Set the configuration of the atom that the user interacts with.  Specifically, this sets the particle atom equal
     * to the current number atom.  This is done here rather than by directly accessing the atom so that the
     * appropriate notifications can be sent and the bucket can be
     * reinitialized.
     *
     * @param {NumberAtom} numberAtom - New configuration of atomic properties to which the atom should be set.
     */
    setAtomConfiguration: function( numberAtom ) {
        this.particleAtom.clear();

        // Add the particles.
        for ( var i = 0; i < numberAtom.electronCount; i++ ) {
          var electron = new Particle( 'electron' );
          this.particleAtom.addParticle( electron );
          this.electrons.push( electron );
        }
        for ( var j = 0; j < numberAtom.protonCount; j++ ) {
          var proton = new Particle( 'proton' );
          this.particleAtom.addParticle( proton );
          this.protons.push( proton );
        }
        for ( var k = 0; k < numberAtom.neutronCount; k++ ) {
          var neutron = new Particle( 'neutron', { velocity: NEUTRON_MOTION_VELOCITY } );
          this.particleAtom.addParticle( neutron );
          this.neutrons.push( neutron );
        }

      this.particleAtom.moveAllParticlesToDestination();

    },

    /**
     * Configure the neutron bucket to have the specified number of particles in it.
     *
     * @param targetNumNeutrons
     */
    setNeutronBucketCount: function( targetNumNeutrons ) {

      this.clearBucket();

      // Add the target number of neutrons, sending notifications the additions.
      for ( var i = 0; i < targetNumNeutrons; i++ ) {
        var newNeutron = new Particle( 'neutron', { velocity: NEUTRON_MOTION_VELOCITY } );
        this.neutronBucket.addParticleFirstOpen( newNeutron, true );
        this.neutrons.push( newNeutron );
      }
    },

    /**
     * Remove all particles that are currently contained in the bucket from both the bucket and from the model.  Note
     * that this does NOT remove the particles from the atom. Note that this function should only be called when the
     * neutron bucket is getting reset.
     */
    clearBucket: function() {
      var thisModel = this;
      this.neutronBucket.getParticleList().forEach( function( neutron, index ) {
        thisModel.neutrons.splice( index, 1 );
        thisModel.neutronBucket.removeParticle( neutron );
      } );
    },

    /**
     * Reset the model.  The sets the atom and the neutron bucket into their
     * default initial states.
     */
    reset: function() {
      // Reset the atom.  This also resets the neutron bucket.
      this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );
    },

    /**
     * Get this neutron bucket.
     *
     * @returns { SphereBucket }
     */
    getNeutronBucket: function() {
      return this.neutronBucket;
    }

  } );
} );
