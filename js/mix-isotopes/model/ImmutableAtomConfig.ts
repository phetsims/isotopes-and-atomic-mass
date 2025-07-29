// Copyright 2019-2020, University of Colorado Boulder

/**
 * atom configuration that doesn't use properties, and thus consumes less memory
 *
 * @author John Blanco
 */

import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import { TReadOnlyNumberAtom } from '../../../../shred/js/model/NumberAtom.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

class ImmutableAtomConfig {

  public readonly protonCount: number;
  public readonly neutronCount: number;
  public readonly electronCount: number;

  public constructor( numProtons: number, numNeutrons: number, numElectrons: number ) {
    this.protonCount = numProtons;
    this.neutronCount = numNeutrons;
    this.electronCount = numElectrons;
  }

  /**
   * Compare two atom configurations, return true if the particle counts are the same.
   */
  public equals( atomConfig: ImmutableAtomConfig | TReadOnlyNumberAtom ): boolean {
    let configsAreEqual: boolean;

    // Support comparison to mutable or immutable atom configurations.
    if ( 'protonCountProperty' in atomConfig ) {
      assert && assert(
      atomConfig.neutronCountProperty !== undefined &&
      atomConfig.electronCountProperty !== undefined,
        'unexpected atom configuration'
      );
      configsAreEqual = this.protonCount === atomConfig.protonCountProperty.value &&
                        this.neutronCount === atomConfig.neutronCountProperty.value &&
                        this.electronCount === atomConfig.electronCountProperty.value;
    }
    else {
      assert && assert(
      atomConfig.neutronCount !== undefined &&
      atomConfig.protonCount !== undefined &&
      atomConfig.electronCount !== undefined,
        'unexpected atom configuration'
      );
      configsAreEqual = this.protonCount === atomConfig.protonCount &&
                        this.neutronCount === atomConfig.neutronCount &&
                        this.electronCount === atomConfig.electronCount;
    }
    return configsAreEqual;
  }

  public getIsotopeAtomicMass(): number {
    return AtomIdentifier.getIsotopeAtomicMass( this.protonCount, this.neutronCount );
  }
}

isotopesAndAtomicMass.register( 'ImmutableAtomConfig', ImmutableAtomConfig );

export default ImmutableAtomConfig;