// Copyright 2015-2025, University of Colorado Boulder

/**
 * This class represents an atom that can move around but is otherwise immutable. It was created due to a need to
 * represent atoms as single entities rather than as a collection of particles. At the time of this writing, this class
 * is used only in Isotopes and Atomic Mass of this simulation.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Color from '../../../../scenery/js/util/Color.js';
import Particle, { ParticleOptions } from '../../../../shred/js/model/Particle.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import ImmutableAtomConfig from './ImmutableAtomConfig.js';
import Vector2 from '../../../../dot/js/Vector2.js';

type SelfOptions = EmptySelfOptions;
export type MovableAtomOptions = SelfOptions & ParticleOptions;

let instanceCount = 0;

class MovableAtom extends Particle {

  public readonly atomConfiguration: ImmutableAtomConfig;
  public showLabel: boolean;
  public readonly instanceCount: number;

  // Color to use for the atom, when shown in the view.  Defaults to black, set value to change.
  public color = Color.BLACK;

  public constructor(
    numProtons: number,
    numNeutrons: number,
    initialPosition: Vector2,
    providedOptions?: MovableAtomOptions
  ) {

    const options = optionize<MovableAtomOptions, SelfOptions, ParticleOptions>()( {
      particleRadius: 10
    }, providedOptions );

    super( 'isotope', options );
    this.positionProperty.set( initialPosition );
    this.destinationProperty.set( initialPosition );

    this.atomConfiguration = new ImmutableAtomConfig( numProtons, numNeutrons, numProtons );
    this.showLabel = true;
    this.instanceCount = instanceCount++;
  }
}

isotopesAndAtomicMass.register( 'MovableAtom', MovableAtom );
export default MovableAtom;