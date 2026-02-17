// Copyright 2015-2026, University of Colorado Boulder

/**
 * PositionableAtom is a model element that represents an atom that can be positioned in 2D space.  The atom has a
 * single position and does not track the positions of its individual particles (protons, neutrons, electrons).  This
 * model element also has a destination Property, which is used to animate the atom moving from one position to another.
 * These atoms are always neutral, meaning that the number of electrons is always equal to the number of protons.
 * Because of this built-in assumption, the number of protons and neutrons are sufficient to fully describe the
 * configuration.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author James Smith
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Particle, { ParticleOptions } from '../../../../shred/js/model/Particle.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import getIsotopeColor from './getIsotopeColor.js';
import NucleusConfig from './NucleusConfig.js';

type SelfOptions = EmptySelfOptions;
export type PositionableAtomOptions = SelfOptions & ParticleOptions;

let instanceCount = 0;

class PositionableAtom extends Particle {

  // The configuration of this atom, which includes the number of protons, neutrons, and electrons.
  public readonly atomConfigurationProperty: Property<NucleusConfig>;

  // Unique identifier for this atom, used for debugging and testing purposes.
  public readonly instanceCount: number;

  public constructor(
    initialProtonCount: number,
    initialNeutronCount: number,
    initialPosition: Vector2,
    providedOptions?: PositionableAtomOptions
  ) {

    const options = optionize<PositionableAtomOptions, SelfOptions, ParticleOptions>()( {
      particleRadius: 10
    }, providedOptions );

    super( 'isotope', options );

    this.positionProperty.set( initialPosition );
    this.destinationProperty.set( initialPosition );
    this.atomConfigurationProperty = new Property(
      new NucleusConfig( initialProtonCount, initialNeutronCount )
    );
    this.instanceCount = instanceCount++;

    // Update the color information - which will be used by the view - based on the atom configuration.
    this.atomConfigurationProperty.link( atomConfig => {
      this.colorProperty.value = getIsotopeColor( atomConfig.protonCount, atomConfig.neutronCount );
    } );
  }
}

isotopesAndAtomicMass.register( 'PositionableAtom', PositionableAtom );
export default PositionableAtom;