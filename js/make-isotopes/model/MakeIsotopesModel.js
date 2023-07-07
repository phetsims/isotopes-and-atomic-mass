// Copyright 2014-2022, University of Colorado Boulder

/**
 * This is the primary model class for the Make Isotopes module. This class acts as the main interface for model
 * actions, and contains the constituent model elements. It watches all neutrons and, based on where they are placed by
 * the user, moves them between the neutron bucket and the atom. In this model, units are picometers (1E-12).
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import { Color } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import NumberAtom from '../../../../shred/js/model/NumberAtom.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';

const neutronsString = IsotopesAndAtomicMassStrings.neutrons;

// constants
const DEFAULT_NUM_NEUTRONS_IN_BUCKET = 4;
const NUCLEUS_JUMP_PERIOD = 0.1; // In seconds
const MAX_NUCLEUS_JUMP = ShredConstants.NUCLEON_RADIUS * 0.5;
const JUMP_ANGLES = [ Math.PI * 0.1, Math.PI * 1.6, Math.PI * 0.7, Math.PI * 1.1, Math.PI * 0.3 ];
const JUMP_DISTANCES = [ MAX_NUCLEUS_JUMP * 0.4, MAX_NUCLEUS_JUMP * 0.8, MAX_NUCLEUS_JUMP * 0.2, MAX_NUCLEUS_JUMP * 0.9 ];
const NUCLEON_CAPTURE_RADIUS = 100; // maximum drop distance for a nucleon to be considered part of the particle
const BUCKET_SIZE = new Dimension2( 130, 60 );
const NEUTRON_BUCKET_POSITION = new Vector2( -220, -180 );
const DEFAULT_ATOM_CONFIG = new NumberAtom( { protonCount: 1, neutronCount: 0, electronCount: 1 } ); // Hydrogen.

class MakeIsotopesModel {

  /**
   * Constructor for a make isotopes model.  This will construct the model with atoms initially in the bucket.
   *
   */
  constructor() {

    // @public - create the atom.
    this.particleAtom = new ParticleAtom();

    // @public - Make available a 'number atom' that tracks the state of the particle atom.
    this.numberAtom = new NumberAtom( {
      protonCount: DEFAULT_ATOM_CONFIG.protonCountProperty.get(),
      neutronCount: DEFAULT_ATOM_CONFIG.neutronCountProperty.get(),
      electronCount: DEFAULT_ATOM_CONFIG.electronCountProperty.get()
    } );

    // @public - events emitted by instances of this type
    this.atomReconfigured = new Emitter();

    // Update the stability state and counter on changes.
    this.nucleusStable = true; // @public
    this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD; // @private
    this.nucleusOffset = Vector2.ZERO; // @private
    this.nucleusJumpCount = 0; // @private

    // Unlink in not required here as it is used through out the sim life
    this.particleAtom.massNumberProperty.link( massNumber => {
      const stable = massNumber > 0 ?
                     AtomIdentifier.isStable( this.particleAtom.protonCountProperty.get(),
                       this.particleAtom.neutronCountProperty.get() ) : true;
      if ( this.nucleusStable !== stable ) {
        // Stability has changed.
        this.nucleusStable = stable;
        if ( stable ) {
          this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
          this.particleAtom.nucleusOffsetProperty.set( Vector2.ZERO );
        }
      }
      if ( this.particleAtom.protonCountProperty.get() > 0 && this.particleAtom.neutronCountProperty.get() >= 0 ) {
        this.atomReconfigured.emit();
      }
    } );

    // Arrays that contain the subatomic particles, whether they are in the  bucket or in the atom.  This is part of a
    // basic assumption about how the model works, which is that the model contains all the particles, and the particles
    // move back and forth from being in the bucket or in in the atom.
    this.neutrons = createObservableArray(); // @public
    this.protons = createObservableArray(); // @public
    this.electrons = createObservableArray(); // @public

    // The bucket that holds the neutrons that are not in the atom.
    // @public
    this.neutronBucket = new SphereBucket( {
      position: NEUTRON_BUCKET_POSITION,
      size: BUCKET_SIZE,
      baseColor: Color.gray,
      captionText: neutronsString,
      sphereRadius: ShredConstants.NUCLEON_RADIUS
    } );

    this.numberAtom.atomUpdated.addListener( () => {
      this.setAtomConfiguration( this.numberAtom );
    } );

    // Set the initial atom configuration.
    this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );

  }

  // Main model step function, called by the framework.
  // @public
  step( dt ) {
    // Update particle positions.
    this.neutrons.forEach( neutron => {
      neutron.step( dt );
    } );

    this.protons.forEach( neutron => {
      neutron.step( dt );
    } );

    if ( this.nucleusStable === false ) {
      this.nucleusJumpCountdown -= dt;
      if ( this.nucleusJumpCountdown <= 0 ) {
        this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
        if ( this.particleAtom.nucleusOffsetProperty.get() === Vector2.ZERO ) {
          this.nucleusJumpCount++;
          const angle = JUMP_ANGLES[ this.nucleusJumpCount % JUMP_ANGLES.length ];
          const distance = JUMP_DISTANCES[ this.nucleusJumpCount % JUMP_DISTANCES.length ];
          this.particleAtom.nucleusOffsetProperty.set(
            new Vector2( Math.cos( angle ) * distance, Math.sin( angle ) * distance ) );
        }
        else {
          this.particleAtom.nucleusOffsetProperty.set( Vector2.ZERO );
        }
      }
    }
  }

  /**
   * Get the current atom of this model, in its number representation
   * @public
   */
  getNumberAtom() {
    return this.numberAtom;
  }

  /**
   *
   * @param {Particle} particle
   * @param {SphereBucket} bucket
   * @param {ParticleAtom} atom
   * @public
   */
  placeNucleon( particle, bucket, atom ) {
    if ( particle.positionProperty.get().distance( atom.positionProperty.get() ) < NUCLEON_CAPTURE_RADIUS ) {
      atom.addParticle( particle );
    }
    else {
      bucket.addParticleNearestOpen( particle, true );
    }
  }

  /**
   *
   * @param {Particle} neutron
   * @param {boolean} lazyLink whether the linking has to be lazy or not
   * @private
   */
  linkNeutron( neutron, lazyLink ) {
    const userControlledLink = userControlled => {
      this.atomReconfigured.emit();
      if ( !userControlled && !this.neutronBucket.containsParticle( neutron ) ) {
        this.placeNucleon( neutron, this.neutronBucket, this.particleAtom );
        this.atomReconfigured.emit();
      }
    };
    if ( lazyLink ) {
      neutron.userControlledProperty.lazyLink( userControlledLink );
    }
    else {
      neutron.userControlledProperty.link( userControlledLink );
    }
    neutron.userControlledPropertyUnlink = () => {
      neutron.userControlledProperty.unlink( userControlledLink );
    };
  }

  // @public
  setNeutronBucketConfiguration() {
    // Add the neutrons to the neutron bucket.
    _.times( DEFAULT_NUM_NEUTRONS_IN_BUCKET, () => {
      const neutron = new Particle( 'neutron' );
      this.neutronBucket.addParticleFirstOpen( neutron, false );
      this.linkNeutron( neutron, false );
      this.neutrons.add( neutron );
    } );
  }

  /**
   * Set the configuration of the atom that the user interacts with.  Specifically, this sets the particle atom equal
   * to the current number atom.  This is done here rather than by directly accessing the atom so that the
   * appropriate notifications can be sent and the bucket can be
   * reinitialized.
   *
   * @param {NumberAtom} numberAtom - New configuration of atomic properties to which the atom should be set.
   * @public
   */
  setAtomConfiguration( numberAtom ) {
    this.particleAtom.clear();
    this.protons.clear();
    this.electrons.clear();
    this.neutrons.forEach( neutron => {
      neutron.userControlledPropertyUnlink();
    } );
    this.neutrons.clear();
    this.neutronBucket.reset();
    if ( this.numberAtom !== numberAtom ) {
      this.numberAtom.protonCountProperty.set( numberAtom.protonCountProperty.get() );
      this.numberAtom.electronCountProperty.set( numberAtom.electronCountProperty.get() );
      this.numberAtom.neutronCountProperty.set( numberAtom.neutronCountProperty.get() );
    }

    // Add the particles.
    for ( let i = 0; i < numberAtom.electronCountProperty.get(); i++ ) {
      const electron = new Particle( 'electron' );
      this.particleAtom.addParticle( electron );
      this.electrons.add( electron );
    }
    for ( let j = 0; j < numberAtom.protonCountProperty.get(); j++ ) {
      const proton = new Particle( 'proton' );
      this.particleAtom.addParticle( proton );
      this.protons.add( proton );
    }
    _.times( numberAtom.neutronCountProperty.get(), () => {
      const neutron = new Particle( 'neutron' );
      this.particleAtom.addParticle( neutron );
      this.neutrons.add( neutron );
      this.linkNeutron( neutron, true );
    } );
    this.particleAtom.moveAllParticlesToDestination();
    this.setNeutronBucketConfiguration();
    this.atomReconfigured.emit();
  }

  /**
   * Reset the model. The sets the atom and the neutron bucket into their default initial states.
   * @public
   */
  reset() {
    // Reset the atom.  This also resets the neutron bucket.
    this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );
  }

  /**
   * Get neutron bucket.
   *
   * @returns { SphereBucket }
   *
   * @public
   */
  getNeutronBucket() {
    return this.neutronBucket;
  }
}

isotopesAndAtomicMass.register( 'MakeIsotopesModel', MakeIsotopesModel );
export default MakeIsotopesModel;