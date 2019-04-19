// Copyright 2019, University of Colorado Boulder

/**
 * atom configuration that doesn't use properties, and thus consumes less memory
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  //modules
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );

  /**
   * @param {number} numProtons
   * @param {number} numNeutrons
   * @param {number} numElectrons
   * @constructor
   */
  function ImmutableAtomConfig( numProtons, numNeutrons, numElectrons ) {
    this.protonCount = numProtons;
    this.neutronCount = numNeutrons;
    this.electronCount = numElectrons;
  }

  isotopesAndAtomicMass.register( 'ImmutableAtomConfig', ImmutableAtomConfig );

  return inherit( Object, ImmutableAtomConfig, {

    /**
     * compare two atom configurations, return true if the particle counts are the same
     * @param {NumberAtom|ImmutableAtomConfig} atomConfig
     * @returns {boolean}
     */
    equals: function( atomConfig ) {

      var configsAreEqual;

      // support comparision to mutable or immutable atom configurations
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
    },

    getIsotopeAtomicMass() {
      return AtomIdentifier.getIsotopeAtomicMass( this.protonCount, this.neutronCount );
    }
  } );
} );

