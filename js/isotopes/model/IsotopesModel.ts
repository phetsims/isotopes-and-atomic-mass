// Copyright 2014-2026, University of Colorado Boulder

/**
 * IsotopesModel is the primary model class for the "Isotopes" screen. This class acts as the main interface for model
 * actions, and contains the constituent model elements. It watches all neutrons and, based on where they are placed by
 * the user, moves them between the neutron bucket and the atom. In this model, units are picometers (1E-12).
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import Color from '../../../../scenery/js/util/Color.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';

type IsDraggingListener = ( isDragging: boolean ) => void;

const neutronsStringProperty = IsotopesAndAtomicMassStrings.neutronsStringProperty;

const DEFAULT_NUM_NEUTRONS_IN_BUCKET = 4;
const NUCLEUS_JUMP_PERIOD = 0.1; // In seconds
const MAX_NUCLEUS_JUMP = ShredConstants.NUCLEON_RADIUS * 0.5;
const JUMP_ANGLES: number[] = [ Math.PI * 0.1, Math.PI * 1.6, Math.PI * 0.7, Math.PI * 1.1, Math.PI * 0.3 ];
const JUMP_DISTANCES: number[] = [ MAX_NUCLEUS_JUMP * 0.4, MAX_NUCLEUS_JUMP * 0.8, MAX_NUCLEUS_JUMP * 0.2, MAX_NUCLEUS_JUMP * 0.9 ];
const NUCLEON_CAPTURE_RADIUS = 100;
const BUCKET_SIZE = new Dimension2( 130, 60 );
const NEUTRON_BUCKET_POSITION = new Vector2( -220, -180 );

class IsotopesModel {

  // The proton count of the element that is currently being worked with. Setting this value is the API for how the
  // currently selected element is changed.
  public selectedElementProtonCountProperty: NumberProperty;

  // Arrays that contain the subatomic particles, whether they are in the bucket or in the atom.
  public readonly neutrons: ObservableArray<Particle>;
  public readonly protons: ObservableArray<Particle>;
  public readonly electrons: ObservableArray<Particle>;

  // The particle atom that the user interacts with to add and remove neutrons to form different isotopes.  This keeps
  // track of the protons, neutrons, and electrons that are in the atom
  public readonly particleAtom: ParticleAtom;

  // The neutron bucket that holds neutrons that are not in the atom.
  public readonly neutronBucket: SphereBucket<Particle>;

  // Variables to track the stability and jump state of the nucleus, which is used to provide visual feedback when the
  // user creates an unstable isotope.
  private nucleusStableProperty: TReadOnlyProperty<boolean>;
  private nucleusJumpCountdown: number;
  private nucleusJumpCount: number;

  // Map to track the drag listeners for each neutron, so that they can be removed when the neutrons are removed from
  // the model.
  private readonly mapNeutronsToDragListeners = new Map<Particle, IsDraggingListener>();

  /**
   * Constructor for the Make Isotopes model. This will construct the model with atoms initially in the bucket.
   */
  public constructor() {

    this.selectedElementProtonCountProperty = new NumberProperty( 1 ); // default to hydrogen

    this.particleAtom = new ParticleAtom( {
      tandem: Tandem.OPT_OUT
    } );

    // The nucleus is considered stable if the current number of protons and neutrons corresponds to a stable isotope.
    this.nucleusStableProperty = new DerivedProperty(
      [ this.particleAtom.massNumberProperty ],
      ( massNumber: number ) => {
        return massNumber > 0 ?
               AtomIdentifier.isStable(
                 this.particleAtom.protonCountProperty.get(),
                 this.particleAtom.neutronCountProperty.get()
               ) : true;
      }
    );

    // Initialize the variable used to control the stability animation.
    this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
    this.nucleusJumpCount = 0;

    // Reset the nucleus jump state whenever the stability of the nucleus changes.
    this.nucleusStableProperty.lazyLink( () => {
      this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
      this.particleAtom.nucleusOffsetProperty.set( Vector2.ZERO );
    } );

    this.neutrons = createObservableArray();
    this.protons = createObservableArray();
    this.electrons = createObservableArray();

    this.neutronBucket = new SphereBucket( {
      position: NEUTRON_BUCKET_POSITION,
      size: BUCKET_SIZE,
      baseColor: Color.gray,
      captionText: neutronsStringProperty,
      sphereRadius: ShredConstants.NUCLEON_RADIUS
    } );

    // Monitor the selected element and update the particles when changes occur.
    this.selectedElementProtonCountProperty.link( protonCount => {
      affirm( protonCount > 0, 'Proton count must be greater than 0.' );
      this.initializeParticles( protonCount );
    } );
  }

  /**
   * Steps the model forward in time, called by the framework.
   * @param dt - time step in seconds
   */
  public step( dt: number ): void {

    // Step the neutrons and protons.  The electrons do not need to be stepped because they are not interactive and
    // do not have any animated behavior.
    this.neutrons.forEach( neutron => neutron.step( dt ) );
    this.protons.forEach( proton => proton.step( dt ) );

    // Animate the nucleus if it is unstable by making it "jump".
    if ( !this.nucleusStableProperty.value ) {
      this.nucleusJumpCountdown -= dt;
      if ( this.nucleusJumpCountdown <= 0 ) {
        this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
        if ( this.particleAtom.nucleusOffsetProperty.get() === Vector2.ZERO ) {
          this.nucleusJumpCount++;
          const angle = JUMP_ANGLES[ this.nucleusJumpCount % JUMP_ANGLES.length ];
          const distance = JUMP_DISTANCES[ this.nucleusJumpCount % JUMP_DISTANCES.length ];
          this.particleAtom.nucleusOffsetProperty.set(
            new Vector2( Math.cos( angle ) * distance, Math.sin( angle ) * distance )
          );
        }
        else {
          this.particleAtom.nucleusOffsetProperty.set( Vector2.ZERO );
        }
      }
    }
  }

  /**
   * Places a neutron in the particle atom if it is close enough, otherwise places it in the neutron bucket.
   */
  private placeNucleon( particle: Particle ): void {
    affirm( particle.type === 'neutron', 'Only neutrons should be interactive in the make isotopes model.' );
    if ( particle.positionProperty.get().distance( this.particleAtom.positionProperty.get() ) < NUCLEON_CAPTURE_RADIUS ) {
      this.particleAtom.addParticle( particle );
    }
    else {
      this.neutronBucket.addParticleNearestOpen( particle, true );
    }
  }

  /**
   * Add a drag listener to the neutron, which will handle moving the neutron between the atom and the neutron bucket.
   */
  private addDragListener( neutron: Particle, lazyLink: boolean ): void {

    affirm( !this.mapNeutronsToDragListeners.has( neutron ), 'Neutron already has a drag listener linked.' );

    const isDraggingHandler = ( isDragging: boolean ) => {
      if ( isDragging ) {
        if ( neutron.containerProperty.value ) {

          // Remove the neutron from its container, which will be either a bucket or the particle atom.
          neutron.containerProperty.value.removeParticle( neutron );
        }
      }
      else if ( !isDragging && neutron.containerProperty.value === null ) {
        this.placeNucleon( neutron );
      }
    };
    if ( lazyLink ) {
      neutron.isDraggingProperty.lazyLink( isDraggingHandler );
    }
    else {
      neutron.isDraggingProperty.link( isDraggingHandler );
    }
    this.mapNeutronsToDragListeners.set( neutron, isDraggingHandler );
  }

  /**
   * Removes the drag listener for the neutron to avoid memory leaks.
   */
  private removeDragListener( neutron: Particle ): void {
    affirm( this.mapNeutronsToDragListeners.has( neutron ), 'Neutron does not have a drag listener linked.' );

    // Remove the drag listener for the neutron.
    const isDraggingHandler = this.mapNeutronsToDragListeners.get( neutron );
    if ( isDraggingHandler ) {
      neutron.isDraggingProperty.unlink( isDraggingHandler );
      this.mapNeutronsToDragListeners.delete( neutron );
    }
  }

  /**
   * Create the subatomic particles for the atom based on the provided proton count, and add them to the particle atom.
   * Also create the neutrons for the neutron bucket.
   */
  private initializeParticles( protonCount: number ): void {

    // Clear the current set of particles.
    this.particleAtom.clear();
    this.protons.clear();
    this.electrons.clear();
    this.neutrons.forEach( neutron => { this.removeDragListener( neutron ); } );
    this.neutrons.clear();
    this.neutronBucket.reset();

    // Identify the most common neutron count for the given proton count, which will be used as the default isotope.
    const mostCommonNeutronCount = AtomIdentifier.getNumNeutronsInMostCommonIsotope( protonCount );

    // Create the particles for the atom.
    _.times( protonCount, () => {
      const proton = new Particle( 'proton' );
      this.particleAtom.addParticle( proton );
      this.protons.add( proton );
    } );
    _.times( mostCommonNeutronCount, () => {
      const neutron = new Particle( 'neutron' );
      this.particleAtom.addParticle( neutron );
      this.neutrons.add( neutron );
      this.addDragListener( neutron, true );
    } );
    _.times( protonCount, () => {
      const electron = new Particle( 'electron' );
      this.particleAtom.addParticle( electron );
      this.electrons.add( electron );
    } );

    // Move the particles to their destinations so they don't animate.
    this.particleAtom.moveAllParticlesToDestination();

    // Add the additional neutrons to the neutron bucket.
    _.times( DEFAULT_NUM_NEUTRONS_IN_BUCKET, () => {
      const neutron = new Particle( 'neutron' );
      this.neutronBucket.addParticleFirstOpen( neutron, false );
      this.addDragListener( neutron, false );
      this.neutrons.add( neutron );
    } );
  }

  public reset(): void {
    this.selectedElementProtonCountProperty.reset();

    // Make sure the neutron count is what it should be for the default isotope.
    const mostCommonNeutronCount = AtomIdentifier.getNumNeutronsInMostCommonIsotope(
      this.selectedElementProtonCountProperty.value
    );
    if ( this.particleAtom.neutronCountProperty.get() !== mostCommonNeutronCount ) {
      this.initializeParticles( this.selectedElementProtonCountProperty.value );
    }
  }
}

isotopesAndAtomicMass.register( 'IsotopesModel', IsotopesModel );
export default IsotopesModel;