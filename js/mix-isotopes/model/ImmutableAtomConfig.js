// Copyright 2019-2020, University of Colorado Boulder

/**
 * atom configuration that doesn't use properties, and thus consumes less memory
 *
 * @author John Blanco
 */

import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

class ImmutableAtomConfig {

  /**
   * @param {number} numProtons
   * @param {number} numNeutrons
   * @param {number} numElectrons
   */
  constructor( numProtons, numNeutrons, numElectrons ) {
    this.protonCount = numProtons;
    this.neutronCount = numNeutrons;
    this.electronCount = numElectrons;
  }

  /**
   * compare two atom configurations, return true if the particle counts are the same
   * @param {NumberAtom|ImmutableAtomConfig} atomConfig
   * @returns {boolean}
   * @public
   */
  equals( atomConfig ) {

    let configsAreEqual;

    // support comparison to mutable or immutable atom configurations
    if ( atomConfig.protonCountProperty ) {

      assert && assert(
      atomConfig.neutronCountProperty && atomConfig.electronCountProperty,
        'atom configuration should be fully mutable or fully immutable'
      );
      configsAreEqual = this.protonCount === atomConfig.protonCountProperty.value &&
                        this.neutronCount === atomConfig.neutronCountProperty.value &&
                        this.electronCount === atomConfig.electronCountProperty.value;
    }
    else {
      assert && assert(
      atomConfig.neutronCount !== undefined && atomConfig.protonCount !== undefined && atomConfig.electronCount !== undefined,
        'unexpected atom configuration'
      );
      configsAreEqual = this.protonCount === atomConfig.protonCount &&
                        this.neutronCount === atomConfig.neutronCount &&
                        this.electronCount === atomConfig.electronCount;
    }
    return configsAreEqual;
  }

  /**
   * @returns {number}
   * @public
   */
  getIsotopeAtomicMass() {
    return AtomIdentifier.getIsotopeAtomicMass( this.protonCount, this.neutronCount );
  }
}

isotopesAndAtomicMass.register( 'ImmutableAtomConfig', ImmutableAtomConfig );

export default ImmutableAtomConfig;