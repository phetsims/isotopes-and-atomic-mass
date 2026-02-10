// Copyright 2015-2026, University of Colorado Boulder

/**
 * PositionableAtom is a model element that represents an atom that can be positioned in 2D space.  The atom has a
 * single position and does not track the positions of its individual particles (protons, neutrons, electrons).
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author James Smith
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Color from '../../../../scenery/js/util/Color.js';
import Particle, { ParticleOptions } from '../../../../shred/js/model/Particle.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import ImmutableAtomConfig from './ImmutableAtomConfig.js';

type SelfOptions = EmptySelfOptions;
export type PositionableAtomOptions = SelfOptions & ParticleOptions;

let instanceCount = 0;

class PositionableAtom extends Particle {

  public readonly atomConfiguration: ImmutableAtomConfig;
  public showLabel: boolean;
  public readonly instanceCount: number;

  // Color to use for the atom, when shown in the view.  Set value to change.
  public color = Color.GREEN;

  public constructor(
    numProtons: number,
    numNeutrons: number,
    initialPosition: Vector2,
    providedOptions?: PositionableAtomOptions
  ) {

    const options = optionize<PositionableAtomOptions, SelfOptions, ParticleOptions>()( {
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

isotopesAndAtomicMass.register( 'PositionableAtom', PositionableAtom );
export default PositionableAtom;