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

  // TODO REVIEW: It seems that atom configuration was changed to nucleus configuration,
  //  so electrons are no longer tracked and there's comments like this around... I feel like going back to AtomConfig
  //  would solve some of that, even if electrons are not really relevant to this sim. https://github.com/phetsims/isotopes-and-atomic-mass/issues/103
  // The configuration of this atom, which includes the number of protons, neutrons, and electrons.
  public readonly atomConfigurationProperty: Property<NucleusConfig>;

  // TODO REVIEW: Now that code is in a good state, should this still exist? It is not used anywhere else. https://github.com/phetsims/isotopes-and-atomic-mass/issues/103
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

    // TODO REVIEW: Why do we need to set destination property at all, it's not used anywhere else in the sim.
    //  But if it's needed, I'd recommend rather using setPositionAndDestination() https://github.com/phetsims/isotopes-and-atomic-mass/issues/103
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