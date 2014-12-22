//  Copyright 2002-2014, University of Colorado Boulder

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
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  var Particle = require( 'SHRED/model/Particle' );
  var ParticleAtom = require( 'SHRED/model/ParticleAtom' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Color = require( 'SCENERY/util/Color' );
  var SharedConstants = require( 'SHRED/SharedConstants' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );

  // Strings
  var neutronsNameString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/neutrons.name' );

  //----------------------------------------------------------------------------
  // Class DataZ
  //----------------------------------------------------------------------------
  // Constant that defines the default number of neutrons in the bucket.
  var DEFAULT_NUM_NEUTRONS_IN_BUCKET = 4;

  // Constants that define the size, position, and appearance of the neutron bucket.
  var BUCKET_SIZE = new Dimension2( 65, 30 );
  var NEUTRON_BUCKET_POSITION = new Vector2( -120, -140 );

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
   * @param {BuildAndAtomClock} clock
   * @constructor
   */
  function MakeIsotopesModel( clock ) {

    // Supertype constructor
    PropertySet.call( this, {} );

    var thisModel = this; // Carry this through scope

    this.clock = clock; // TODO: Clock seems to be the JAVA way to step in time, might be unnecessary now.

    // Create the atom.
    this.particleAtom = new ParticleAtom( {position: Vector2.ZERO } ); // TODO: Java file passed clock into atom.

    // Make available a 'number atom' that tracks the state of the particle atom.
    this.numberAtom = new NumberAtom();
    var updateNumberAtom = function() {
      thisModel.numberAtom.protonCount = thisModel.particleAtom.protons.length;
      thisModel.numberAtom.neutronCount = thisModel.particleAtom.neutrons.length;
      thisModel.numberAtom.electronCount = thisModel.particleAtom.electrons.length;
    };

    // Update the number atom when the particle atom changes.
    thisModel.particleAtom.protons.lengthProperty.link( updateNumberAtom );
    thisModel.particleAtom.electrons.lengthProperty.link( updateNumberAtom );
    thisModel.particleAtom.neutrons.lengthProperty.link( updateNumberAtom );

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

    // Add the neutrons to the bucket.
    for ( var i = 0; i < DEFAULT_NUM_NEUTRONS_IN_BUCKET; i++ ) {
      var neutron = new Particle( 'neutron' );
      this.neutrons.push( neutron );
//      neutron.addListener( new SphericalParticle.Adapter() {
//        @Override
//        public void droppedByUser( SphericalParticle particle ) {
//          // The user just released this neutron.  If it is close
//          // enough to the nucleus, send it there, otherwise
//          // send it to its bucket.
//          if ( neutron.getPosition().distance( atom.getPosition() ) < NUCLEUS_CAPTURE_DISTANCE ) {
//            atom.addNeutron( neutron, false );
//          }
//          else {
//            neutronBucket.addParticleNearestOpen( neutron, false );
//          }
//        }
//      } );
    }

    // Set the initial atom configuration.
    this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );
//  // Listener support
//  private final ArrayList<Listener> listeners = new ArrayList<Listener>();
//
//  // An event listener that watches for when the user releases a neutron and
//  // decides whether it should go in the bucket or the atom's nucleus.
//  private final SphericalParticle.Adapter neutronDropListener = new SphericalParticle.Adapter() {
//    @Override
//    public void droppedByUser( SphericalParticle particle ) {
//      assert particle instanceof Neutron; // Should always be a neutron.
//      assert neutrons.contains( particle ); // Particle should always be contained by model.
//      // The user just released this neutron.  If it is close
//      // enough to the nucleus, send it there, otherwise
//      // send it to its bucket.
//      if ( particle.getPosition().distance( atom.getPosition() ) < NUCLEUS_CAPTURE_DISTANCE ) {
//        atom.addNeutron( (Neutron) particle, false );
//      }
//      else {
//        neutronBucket.addParticleNearestOpen( particle, false );
//      }
//    }
//  };

  }

  return inherit( PropertySet, MakeIsotopesModel, {
    /**
     * Get the clock of this MakeIsotopesModel.
     *
     * @return {Clock}
     */
    getClock: function() {
      return this.clock;
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
     * Set the configuration of the atom that the user interacts with.  This
     * is done here rather than by directly accessing the atom so that the
     * appropriate notifications can be sent and the bucket can be
     * reinitialized.
     *
     * @param {NumberAtom} numberAtom - New configuration of atomic properties to which the atom should be set.
     */
    setAtomConfiguration: function( numberAtom ) {
      if ( !this.numberAtom.equals( numberAtom ) ) {

        // Clear the atom.
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

        // Whenever the atom configuration is set, the neutron bucket is set to contain its default number of neutrons.
        this.setNeutronBucketCount( DEFAULT_NUM_NEUTRONS_IN_BUCKET );
      }
    },

    /**
     * Configure the neutron bucket to have the specified number of particles in it.
     *
     * @param targetNumNeutrons
     */
    setNeutronBucketCount: function( targetNumNeutrons ) {
      this.clearBucket();

      // Add the target number of neutrons, sending notifications of
      // the additions.
      for ( var i = 0; i < targetNumNeutrons; i++ ) {
        var newNeutron = new Particle( 'neutron', { velocity: NEUTRON_MOTION_VELOCITY } );
        this.neutronBucket.addParticleFirstOpen( newNeutron, true ); // TODO: I do not understand what the value of this boolean should be yet.
        this.neutrons.push( newNeutron );
      }
    },

    /**
     * Remove all particles that are currently contained in the bucket from both the bucket and from the model.  Note
     * that this does NOT remove the particles from the atom.
     */
    clearBucket: function() {
      var thisModel = this;
      this.neutronBucket.getParticleList().forEach( function( neutron ) {
        this.neutrons.remove( neutron );
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
