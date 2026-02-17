// Copyright 2019-2026, University of Colorado Boulder

/**
 * NucleusConfig is an immutable configuration for an atomic nucleus, including the number of protons and neutrons.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import NumberAtom, { TReadOnlyNumberAtom } from '../../../../shred/js/model/NumberAtom.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

class NucleusConfig {

  public readonly protonCount: number;
  public readonly neutronCount: number;

  public constructor( numProtons: number, numNeutrons: number ) {
    this.protonCount = numProtons;
    this.neutronCount = numNeutrons;
  }

  /**
   * Compare two nucleus configurations, return true if the particle counts are the same.
   */
  public equals( nucleusConfig: NucleusConfig ): boolean {
    return this.protonCount === nucleusConfig.protonCount &&
           this.neutronCount === nucleusConfig.neutronCount;
  }

  /**
   * Get the atomic mass for this nucleus configuration.
   */
  public getAtomicMass(): number {
    return AtomIdentifier.getIsotopeAtomicMass( this.protonCount, this.neutronCount );
  }

  /**
   * Get the mass number for this isotope configuration, which is the sum of the number of protons and neutrons.
   */
  public getMassNumber(): number {
    return this.protonCount + this.neutronCount;
  }

  /**
   * String representation, useful for debugging.
   */
  public toString(): string {
    return `protonCount: ${this.protonCount}, neutronCount: ${this.neutronCount}`;
  }

  /**
   * Convert this NucleusConfig to a NumberAtom, which includes the number of electrons (assumed to be equal to the
   * number of protons for a neutral atom).  This is useful for interoperability with other parts of the code that use
   * NumberAtom to represent atom configurations.
   */
  public toNumberAtom(): NumberAtom {
    return new NumberAtom( {
      protonCount: this.protonCount,
      neutronCount: this.neutronCount,
      electronCount: this.protonCount // Assume a neutral atom, so electrons = protons
    } );
  }

  /**
   * Create a NucleusConfig from a TReadOnlyNumberAtom.
   */
  public static getConfiguration( atom: TReadOnlyNumberAtom ): NucleusConfig {
    return new NucleusConfig(
      atom.protonCountProperty.value,
      atom.neutronCountProperty.value
    );
  }
}

isotopesAndAtomicMass.register( 'NucleusConfig', NucleusConfig );

export default NucleusConfig;