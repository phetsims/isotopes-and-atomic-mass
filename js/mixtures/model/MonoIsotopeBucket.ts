// Copyright 2015-2026, University of Colorado Boulder

/**
 * A particle bucket that can only contain one configuration of isotope, though it may contain multiple instances
 * of that isotope.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

import SphereBucket, { SphereBucketOptions } from '../../../../phetcommon/js/model/SphereBucket.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import PositionableAtom from './PositionableAtom.js';

class MonoIsotopeBucket extends SphereBucket<PositionableAtom> {

  public readonly numProtonsInIsotope: number;
  public readonly numNeutronsInIsotope: number;

  /**
   * @param numProtonsInIsotope - Number of protons in the isotope this bucket holds
   * @param numNeutronsInIsotope - Number of neutrons in the isotope this bucket holds
   * @param options - Options that control the appearance and behavior of the bucket
   */
  public constructor( numProtonsInIsotope: number, numNeutronsInIsotope: number, options?: SphereBucketOptions ) {
    super( options );

    this.numProtonsInIsotope = numProtonsInIsotope;
    this.numNeutronsInIsotope = numNeutronsInIsotope;
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
   * Tests to see if an isotope matches the MonoIsotopeBucket.
   */
  public isIsotopeAllowed( numProtons: number, numNeutrons: number ): boolean {
    return this.numProtonsInIsotope === numProtons && this.numNeutronsInIsotope === numNeutrons;
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