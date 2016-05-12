// Copyright 2014-2015, University of Colorado Boulder

/**
 * This is the primary model class for the Make Isotopes module. This class acts as the main interface for model
 * actions, and contains the constituent model elements. It watches all neutrons and, based on where they are placed by
 * the user, moves them between the neutron bucket and the atom. In this model, units are picometers (1E-12).
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

define( function( require ) {
  'use strict';

  // modules
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Particle = require( 'SHRED/model/Particle' );
  var ParticleAtom = require( 'SHRED/model/ParticleAtom' );
  var PropertySet = require('AXON/PropertySet');
  var SharedConstants = require( 'SHRED/SharedConstants' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var neutronsTitleString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/neutrons.title' );

  // constants
  var DEFAULT_NUM_NEUTRONS_IN_BUCKET = 4;
  var NUCLEUS_JUMP_PERIOD = 0.1; // In seconds
  var MAX_NUCLEUS_JUMP = SharedConstants.NUCLEON_RADIUS * 0.5;
  var JUMP_ANGLES = [ Math.PI * 0.1, Math.PI * 1.6, Math.PI * 0.7, Math.PI * 1.1, Math.PI * 0.3 ];
  var JUMP_DISTANCES = [ MAX_NUCLEUS_JUMP * 0.4, MAX_NUCLEUS_JUMP * 0.8, MAX_NUCLEUS_JUMP * 0.2, MAX_NUCLEUS_JUMP * 0.9 ];
  var NUCLEON_CAPTURE_RADIUS = 100; // maximum drop distance for a nucleon to be considered part of the particle
  var BUCKET_SIZE = new Dimension2( 130, 60 );
  var NEUTRON_BUCKET_POSITION = new Vector2( -220, -180 );
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
    var self = this;

    // create the atom.
    this.particleAtom = new ParticleAtom(); // @public

    // Make available a 'number atom' that tracks the state of the particle atom.
    // @public
    this.numberAtom = new NumberAtom( {
      protonCount: DEFAULT_ATOM_CONFIG.protonCount,
      neutronCount: DEFAULT_ATOM_CONFIG.neutronCount,
      electronCount: DEFAULT_ATOM_CONFIG.electronCount
    } );

    // Update the stability state and counter on changes.
    self.nucleusStable = true; // @public
    self.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD; // @private
    self.nucleusOffset = Vector2.ZERO; // @private
    // Unlink in not required here as it is used through out the sim life
    self.particleAtom.massNumberProperty.link( function( massNumber ) {
      var stable = massNumber > 0 ?
                   AtomIdentifier.isStable( self.particleAtom.protonCount, self.particleAtom.neutronCount ) : true;
      if ( self.nucleusStable !== stable ) {
        // Stability has changed.
        self.nucleusStable = stable;
        if ( stable ) {
          self.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
          self.particleAtom.nucleusOffset = Vector2.ZERO;
        }
      }
      if ( self.particleAtom.protonCount > 0 && self.particleAtom.neutronCount > 0 ) {
        self.trigger( 'atomReconfigured' );
      }
    } );

    // Arrays that contain the subatomic particles, whether they are in the  bucket or in the atom.  This is part of a
    // basic assumption about how the model works, which is that the model contains all the particles, and the particles
    // move back and forth from being in the bucket or in in the atom.
    this.neutrons = new ObservableArray(); // @public
    this.protons = new ObservableArray(); // @public
    this.electrons = new ObservableArray(); // @public

    // The bucket that holds the neutrons that are not in the atom.
    // @public
    this.neutronBucket = new SphereBucket( {
      position: NEUTRON_BUCKET_POSITION,
      size: BUCKET_SIZE,
      baseColor: Color.gray,
      caption: neutronsTitleString,
      sphereRadius: SharedConstants.NUCLEON_RADIUS
    } );

    this.numberAtom.on( 'atomUpdated', function() {
      self.setAtomConfiguration( self.numberAtom );
    });

    // Set the initial atom configuration.
    this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );

  }

  isotopesAndAtomicMass.register( 'MakeIsotopesModel', MakeIsotopesModel );
  return inherit( PropertySet, MakeIsotopesModel, {
    _nucleusJumpCount: 0,
    // Main model step function, called by the framework.
    // @public
    step: function( dt ) {
      // Update particle positions.
      this.neutrons.forEach( function( neutron ) {
        neutron.step( dt );
      } );

      this.protons.forEach( function( neutron ) {
        neutron.step( dt );
      } );

      if ( this.nucleusStable === false ) {
        this.nucleusJumpCountdown -= dt;
        if ( this.nucleusJumpCountdown <= 0 ) {
          this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
          if ( this.particleAtom.nucleusOffset === Vector2.ZERO ) {
            this._nucleusJumpCount++;
            var angle = JUMP_ANGLES[ this._nucleusJumpCount % JUMP_ANGLES.length ];
            var distance = JUMP_DISTANCES[ this._nucleusJumpCount % JUMP_DISTANCES.length ];
            this.particleAtom.nucleusOffset = new Vector2( Math.cos( angle ) * distance, Math.sin( angle ) * distance );
          }
          else {
            this.particleAtom.nucleusOffset = Vector2.ZERO;
          }
        }
      }
    },

    /**
     * Get the current atom of this model, in its number representation
     * @public
     */
    getNumberAtom: function() {
      return this.numberAtom;
    },

    /**
     *
     * @param {Particle} particle
     * @param {SphereBucket} bucket
     * @param {ParticleAtom} atom
     * @public
     */
    placeNucleon: function( particle, bucket, atom ) {
      if ( particle.position.distance( atom.position ) < NUCLEON_CAPTURE_RADIUS ) {
        atom.addParticle( particle );
      }
      else {
        bucket.addParticleNearestOpen( particle, true );
      }
    },

    /**
     *
     * @param {Particle} neutron
     * @param {boolean} lazyLink whether the linking has to be lazy or not
     * @private
     */
    linkNeutron: function( neutron, lazyLink ){
      var self = this;
      var userControlledLink = function( userControlled ) {
        self.trigger( 'atomReconfigured' );
        if ( !userControlled && !self.neutronBucket.containsParticle( neutron ) ) {
          self.placeNucleon( neutron, self.neutronBucket, self.particleAtom );
          self.trigger( 'atomReconfigured' );
        }
      };
      if( lazyLink ){
        neutron.userControlledProperty.lazyLink( userControlledLink );
      }
      else{
        neutron.userControlledProperty.link( userControlledLink );
      }
      neutron.userControlledPropertyUnlink = function(){
        neutron.userControlledProperty.unlink( userControlledLink );
      }
    },

    // @public
    setNeutronBucketConfiguration: function () {
      var self = this;
      // Add the neutrons to the neutron bucket.
      _.times( DEFAULT_NUM_NEUTRONS_IN_BUCKET, function() {
        var neutron = new Particle( 'neutron' );
        self.neutronBucket.addParticleFirstOpen( neutron, false );
        self.linkNeutron( neutron, false );
        self.neutrons.add( neutron );
      } );
    },

    /**
     * Set the configuration of the atom that the user interacts with.  Specifically, this sets the particle atom equal
     * to the current number atom.  This is done here rather than by directly accessing the atom so that the
     * appropriate notifications can be sent and the bucket can be
     * reinitialized.
     *
     * @param {NumberAtom} numberAtom - New configuration of atomic properties to which the atom should be set.
     * @public
     */
    setAtomConfiguration: function( numberAtom ) {
      var self = this;
      this.particleAtom.clear();
      this.protons.clear();
      this.electrons.clear();
      this.neutrons.forEach( function( neutron ) {
        neutron.userControlledPropertyUnlink();
      } );
      this.neutrons.clear();
      this.neutronBucket.reset();
      if ( this.numberAtom !== numberAtom ) {
        this.numberAtom.protonCount = numberAtom.protonCount;
        this.numberAtom.electronCount = numberAtom.electronCount;
        this.numberAtom.neutronCount = numberAtom.neutronCount;
      }

      // Add the particles.
      for ( var i = 0; i < numberAtom.electronCount; i++ ) {
        var electron = new Particle( 'electron' );
        this.particleAtom.addParticle( electron );
        this.electrons.add( electron );
      }
      for ( var j = 0; j < numberAtom.protonCount; j++ ) {
        var proton = new Particle( 'proton' );
        this.particleAtom.addParticle( proton );
        this.protons.add( proton );
      }
      _.times( numberAtom.neutronCount, function() {
        var neutron = new Particle( 'neutron' );
        self.particleAtom.addParticle( neutron );
        self.neutrons.add( neutron );
        self.linkNeutron( neutron, true );
      });
      this.particleAtom.moveAllParticlesToDestination();
      this.setNeutronBucketConfiguration();
      this.trigger( 'atomReconfigured' );
    },

    /**
     * Reset the model. The sets the atom and the neutron bucket into their default initial states.
     * @public
     */
    reset: function() {
      // Reset the atom.  This also resets the neutron bucket.
      this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );
    },

    /**
     * Get neutron bucket.
     *
     * @returns { SphereBucket }
     *
     * @public
     */
    getNeutronBucket: function() {
      return this.neutronBucket;
    }

  } );
} );
