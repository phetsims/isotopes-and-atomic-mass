// Copyright 2015-2026, University of Colorado Boulder

/**
 * A particle bucket that can only contain one configuration of isotope, though it may contain multiple instances
 * (i.e. atoms) of that isotope.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Jesse Greenberg
 * @author James Smith
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import TProperty from '../../../../axon/js/TProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import SphereBucket, { SphereBucketOptions } from '../../../../phetcommon/js/model/SphereBucket.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import getIsotopeColor from './getIsotopeColor.js';
import NucleusConfig from './NucleusConfig.js';
import PositionableAtom from './PositionableAtom.js';

type SelfOptions = EmptySelfOptions;
export type MonoIsotopeBucketOptions = SelfOptions & StrictOmit<SphereBucketOptions, 'baseColor'>;

// TODO: See https://github.com/phetsims/isotopes-and-atomic-mass/issues/103.  There are some decisions to be made about
//       the state behavior of buckets that I (jbphet) have deferred until the state refactor is a little further along.
//       One specific example is what should happen to particles in a bucket when it is reconfigured.  Also, should
//       buckets have an active property to control whether it appears in the view?  That sort of thing.  Come back to
//       this.

class MonoIsotopeBucket extends SphereBucket<PositionableAtom> {

  // The configuration of the isotope that this bucket can hold. This is used to determine if an isotope can be added to
  // the bucket, and to determine the color of the bucket.  Clients can change the configuration of the bucket by
  // setting this Property.
  public readonly isotopeConfigProperty: TProperty<NucleusConfig>;

  public constructor( initialIsotopeConfig: NucleusConfig, providedOptions?: MonoIsotopeBucketOptions ) {

    const isotopeConfigProperty = new Property<NucleusConfig>( initialIsotopeConfig );

    const options = optionize<MonoIsotopeBucketOptions, SelfOptions, SphereBucketOptions>()( {

      // Derive the color of the bucket from the isotope it holds.
      baseColor: new DerivedProperty( [ isotopeConfigProperty ], ( isotopeConfig: NucleusConfig ) => {
        return getIsotopeColor( isotopeConfig.protonCount, isotopeConfig.neutronCount );
      } )

    }, providedOptions );

    super( options );

    this.isotopeConfigProperty = isotopeConfigProperty;
  }

  /**
   * Add an isotope to the first open position in the bucket.
   */
  public addIsotopeInstanceFirstOpen( isotope: PositionableAtom, moveImmediately: boolean ): void {
    if ( this.isIsotopeAllowed(
      isotope.atomConfigurationProperty.value.protonCount,
      isotope.atomConfigurationProperty.value.neutronCount )
    ) {
      this.addParticleFirstOpen( isotope, moveImmediately );
    }
  }

  /**
   * Tests to see if an isotope is allowed in this instance based on the current configuration.
   */
  public isIsotopeAllowed( numProtons: number, numNeutrons: number ): boolean {
    return this.isotopeConfigProperty.value.protonCount === numProtons &&
           this.isotopeConfigProperty.value.neutronCount === numNeutrons;
  }

  /**
   * Add an isotope to the nearest open position in the bucket.
   */
  public addIsotopeInstanceNearestOpen( isotope: PositionableAtom, animate: boolean ): void {
    if ( this.isIsotopeAllowed(
      isotope.atomConfigurationProperty.value.protonCount,
      isotope.atomConfigurationProperty.value.neutronCount
    ) ) {
      this.addParticleNearestOpen( isotope, animate );
    }
  }
}

isotopesAndAtomicMass.register( 'MonoIsotopeBucket', MonoIsotopeBucket );
export default MonoIsotopeBucket;