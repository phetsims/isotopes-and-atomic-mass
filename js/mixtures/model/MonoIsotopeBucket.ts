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
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import SphereBucket, { SphereBucketOptions } from '../../../../phetcommon/js/model/SphereBucket.js';
import AtomNameUtils from '../../../../shred/js/AtomNameUtils.js';
import AtomConfig from '../../../../shred/js/model/AtomConfig.js';
import getIsotopeColor from './getIsotopeColor.js';
import PositionableAtom from './PositionableAtom.js';

type SelfOptions = EmptySelfOptions;
export type MonoIsotopeBucketOptions = SelfOptions & StrictOmit<SphereBucketOptions, 'baseColor' | 'captionText'>;

class MonoIsotopeBucket extends SphereBucket<PositionableAtom> {

  // The configuration of the isotope that this bucket can hold. This is used to determine if an isotope can be added to
  // the bucket, and to determine the color of the bucket.  Clients can change the configuration of the bucket by
  // setting this Property.
  public readonly isotopeConfigProperty: TProperty<AtomConfig>;

  public readonly particleCountProperty = new Property( 0 );

  private readonly disposeMonoIsotopeBucket: () => void;

  public constructor( initialIsotopeConfig: AtomConfig, providedOptions?: MonoIsotopeBucketOptions ) {

    const isotopeConfigProperty = new Property<AtomConfig>( initialIsotopeConfig );

    // Create the string for the element name.  This has to be a dynamic property because the proton count can change
    // the selected element, but changing the locale can change that element's name.
    const emptyStringProperty = new StringProperty( '' );
    const elementNameProperty = new DerivedProperty(
      [ isotopeConfigProperty ],
      isotopeConfig => {
        if ( isotopeConfig.protonCount > 0 ) {
          return AtomNameUtils.getName( isotopeConfig.protonCount );
        }
        else {
          return emptyStringProperty;
        }
      }
    );
    const elementNameDynamicProperty: TReadOnlyProperty<string> = new DynamicProperty( elementNameProperty );

    // Create the string for the isotope name, which will look like "Hydrogen-2", "Neon-10, etc.
    const isotopeNameProperty = new DerivedProperty(
      [ elementNameDynamicProperty, isotopeConfigProperty ],
      ( elementName, isotopeConfig ) => {
        if ( isotopeConfig.protonCount > 0 ) {
          return `${elementName}-${isotopeConfig.getMassNumber()}`;
        }
        else {
          return '';
        }
      }
    );

    // Derive the color of the bucket from the isotope it holds.
    const baseColorProperty = new DerivedProperty( [ isotopeConfigProperty ], ( isotopeConfig: AtomConfig ) => {
      return getIsotopeColor( isotopeConfig.protonCount, isotopeConfig.neutronCount );
    } );

    const options = optionize<MonoIsotopeBucketOptions, SelfOptions, SphereBucketOptions>()( {

      baseColor: baseColorProperty,
      captionText: isotopeNameProperty

    }, providedOptions );

    super( options );

    this.isotopeConfigProperty = isotopeConfigProperty;

    this.disposeMonoIsotopeBucket = () => {
      isotopeConfigProperty.dispose();
      elementNameProperty.dispose();
      elementNameDynamicProperty.dispose();
      isotopeNameProperty.dispose();
      baseColorProperty.dispose();
    };
  }

  /**
   * Add an isotope to the first open position in the bucket.
   */
  public addIsotopeInstanceFirstOpen( isotope: PositionableAtom, animate = false ): void {
    if ( this.isIsotopeAllowed(
      isotope.atomConfigurationProperty.value.protonCount,
      isotope.atomConfigurationProperty.value.neutronCount )
    ) {
      this.addParticleFirstOpen( isotope, animate );
      this.particleCountProperty.value = this.getParticleList().length;
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
      this.particleCountProperty.value = this.getParticleList().length;
    }
  }

  public override removeParticle( particle: PositionableAtom, skipLayout = false ): void {
    super.removeParticle( particle, skipLayout );
    this.particleCountProperty.value = this.getParticleList().length;
  }

  /**
   * release memory references
   */
  public override dispose(): void {
    this.disposeMonoIsotopeBucket();
    super.dispose();
  }
}

export default MonoIsotopeBucket;
