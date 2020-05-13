// Copyright 2015-2020, University of Colorado Boulder

/**
 * A particle bucket that can only contain one configuration of isotope, though it may contain multiple instances
 * of that isotope.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

import ObservableArray from '../../../../axon/js/ObservableArray.js';
import inherit from '../../../../phet-core/js/inherit.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import MovableAtom from './MovableAtom.js';

/**
 * Constructor.
 * @param {number} numProtonsInIsotope
 * @param {number} numNeutronsInIsotope
 * @param {Object} [options]
 */
function MonoIsotopeBucket( numProtonsInIsotope, numNeutronsInIsotope, options ) {
  SphereBucket.call( this, options );

  this.numProtonsInIsotope = numProtonsInIsotope; // @public
  this.numNeutronsInIsotope = numNeutronsInIsotope; // @public
}

isotopesAndAtomicMass.register( 'MonoIsotopeBucket', MonoIsotopeBucket );
inherit( SphereBucket, MonoIsotopeBucket, {
  /**
   * Add an isotope to the first open position in the bucket.
   *
   * @param {MovableAtom} isotope
   * @param {boolean} moveImmediately
   *
   * @public
   */
  addIsotopeInstanceFirstOpen: function( isotope, moveImmediately ) {
    if ( this.isIsotopeAllowed( isotope.atomConfiguration.protonCount, isotope.atomConfiguration.neutronCount ) ) {
      this.addParticleFirstOpen( isotope, moveImmediately );
    }
  },

  /**
   * Tests to see if an isotope matches the MonoIsotopeBucket.
   *
   * @param {number} numProtons
   * @param {number} numNeutrons
   * @returns {boolean}
   *
   * @public
   */
  isIsotopeAllowed: function( numProtons, numNeutrons ) {
    return this.numProtonsInIsotope === numProtons && this.numNeutronsInIsotope === numNeutrons;
  },

  /**
   * Add an isotope to the nearest open position in the bucket.
   *
   * @param {MovableAtom} isotope
   * @param {boolean} animate
   *
   * @public
   */
  addIsotopeInstanceNearestOpen: function( isotope, animate ) {
    if ( this.isIsotopeAllowed( isotope.atomConfiguration.protonCount, isotope.atomConfiguration.neutronCount ) ) {
      this.addParticleNearestOpen( isotope, animate );
    }
  },

  /**
   * Get a list of all isotopes contained within this bucket.
   * @returns {ObservableArray} containedIsotopes
   *
   * @public
   */
  getContainedIsotopes: function() {
    const containedIsotopes = new ObservableArray();
    this.getParticleList().forEach( function( isotope ) {
      assert && assert( isotope instanceof MovableAtom );
      containedIsotopes.push( isotope );
    } );

    return containedIsotopes;
  }
} );

export default MonoIsotopeBucket;
