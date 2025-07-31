// Copyright 2014-2025, University of Colorado Boulder

/**
 * This is the primary model class for the Make Isotopes module. This class acts as the main interface for model
 * actions, and contains the constituent model elements. It watches all neutrons and, based on where they are placed by
 * the user, moves them between the neutron bucket and the atom. In this model, units are picometers (1E-12).
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import Color from '../../../../scenery/js/util/Color.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import NumberAtom from '../../../../shred/js/model/NumberAtom.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';

type IsDraggingListener = ( isDragging: boolean ) => void;

const neutronsString: string = IsotopesAndAtomicMassStrings.neutrons;

const DEFAULT_NUM_NEUTRONS_IN_BUCKET = 4;
const NUCLEUS_JUMP_PERIOD = 0.1; // In seconds
const MAX_NUCLEUS_JUMP = ShredConstants.NUCLEON_RADIUS * 0.5;
const JUMP_ANGLES: number[] = [ Math.PI * 0.1, Math.PI * 1.6, Math.PI * 0.7, Math.PI * 1.1, Math.PI * 0.3 ];
const JUMP_DISTANCES: number[] = [ MAX_NUCLEUS_JUMP * 0.4, MAX_NUCLEUS_JUMP * 0.8, MAX_NUCLEUS_JUMP * 0.2, MAX_NUCLEUS_JUMP * 0.9 ];
const NUCLEON_CAPTURE_RADIUS = 100;
const BUCKET_SIZE = new Dimension2( 130, 60 );
const NEUTRON_BUCKET_POSITION = new Vector2( -220, -180 );
const DEFAULT_ATOM_CONFIG = new NumberAtom( { protonCount: 1, neutronCount: 0, electronCount: 1 } ); // hydrogen atom

class MakeIsotopesModel {

  public readonly particleAtom: ParticleAtom;
  public readonly numberAtom: NumberAtom;
  public readonly atomReconfigured: Emitter;
  public nucleusStable: boolean;
  private nucleusJumpCountdown: number;
  private nucleusJumpCount: number;
  public readonly neutrons: ObservableArray<Particle>;
  public readonly protons: ObservableArray<Particle>;
  public readonly electrons: ObservableArray<Particle>;
  public readonly neutronBucket: SphereBucket<Particle>;
  private readonly mapNeutronsToDragListeners = new Map<Particle, IsDraggingListener>();

  public constructor() {
    this.particleAtom = new ParticleAtom( {
      tandem: Tandem.OPT_OUT
    } );

    this.numberAtom = new NumberAtom( {
      protonCount: DEFAULT_ATOM_CONFIG.protonCountProperty.get(),
      neutronCount: DEFAULT_ATOM_CONFIG.neutronCountProperty.get(),
      electronCount: DEFAULT_ATOM_CONFIG.electronCountProperty.get()
    } );

    this.atomReconfigured = new Emitter();

    this.nucleusStable = true;
    this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
    this.nucleusJumpCount = 0;

    this.particleAtom.massNumberProperty.link( ( massNumber: number ) => {
      const stable = massNumber > 0 ?
                     AtomIdentifier.isStable(
                       this.particleAtom.protonCountProperty.get(),
                       this.particleAtom.neutronCountProperty.get()
                     ) : true;
      if ( this.nucleusStable !== stable ) {
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

    this.neutrons = createObservableArray();
    this.protons = createObservableArray();
    this.electrons = createObservableArray();

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

    this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );
  }

  public step( dt: number ): void {
    this.neutrons.forEach( neutron => {
      neutron.step( dt );
    } );

    this.protons.forEach( proton => {
      proton.step( dt );
    } );

    if ( !this.nucleusStable ) {
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
    assert && assert( particle.type === 'neutron', 'Only neutrons should be interactive in the make isotopes model.' );
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

    assert && assert( !this.mapNeutronsToDragListeners.has( neutron ), 'Neutron already has a drag listener linked.' );

    const isDraggingHandler = ( isDragging: boolean ) => {
      if ( isDragging ) {
        if ( neutron.containerProperty.value ) {

          const preRemovalContainer = neutron.containerProperty.value;

          // Remove the neutron from its container, which will be either a bucket or the particle atom.
          neutron.containerProperty.value.removeParticle( neutron );

          if ( preRemovalContainer === this.particleAtom ) {
            this.atomReconfigured.emit();
          }
        }
      }
      else if ( !isDragging && neutron.containerProperty.value === null ) {
        this.placeNucleon( neutron );
        if ( neutron.containerProperty.value === this.particleAtom ) {
          this.atomReconfigured.emit();
        }
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
    assert && assert( this.mapNeutronsToDragListeners.has( neutron ), 'Neutron does not have a drag listener linked.' );

    // Remove the drag listener for the neutron.
    const isDraggingHandler = this.mapNeutronsToDragListeners.get( neutron );
    if ( isDraggingHandler ) {
      neutron.isDraggingProperty.unlink( isDraggingHandler );
      this.mapNeutronsToDragListeners.delete( neutron );
    }
  }

  public setAtomConfiguration( numberAtom: NumberAtom ): void {

    // Clear the current atom configuration.
    this.particleAtom.clear();
    this.protons.clear();
    this.electrons.clear();
    this.neutrons.forEach( neutron => { this.removeDragListener( neutron ); } );
    this.neutrons.clear();
    this.neutronBucket.reset();

    // Set the new atom configuration (but not redundantly, or we could get recursion).
    if ( numberAtom !== this.numberAtom ) {
      this.numberAtom.setSubAtomicParticleCount(
        numberAtom.protonCountProperty.get(),
        numberAtom.neutronCountProperty.get(),
        numberAtom.electronCountProperty.get()
      );
    }

    // Create the particles for the atom based on the number atom's properties.
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
    for ( let k = 0; k < numberAtom.neutronCountProperty.get(); k++ ) {
      const neutron = new Particle( 'neutron' );
      this.particleAtom.addParticle( neutron );
      this.neutrons.add( neutron );
      this.addDragListener( neutron, true );
    }
    this.particleAtom.moveAllParticlesToDestination();

    // Add the neutrons to the neutron bucket.
    _.times( DEFAULT_NUM_NEUTRONS_IN_BUCKET, () => {
      const neutron = new Particle( 'neutron' );
      this.neutronBucket.addParticleFirstOpen( neutron, false );
      this.addDragListener( neutron, false );
      this.neutrons.add( neutron );
    } );

    // Emit an event to notify that the atom has been reconfigured.
    this.atomReconfigured.emit();
  }

  public reset(): void {
    this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );
    this.numberAtom.atomUpdated.emit();
  }
}

isotopesAndAtomicMass.register( 'MakeIsotopesModel', MakeIsotopesModel );
export default MakeIsotopesModel;