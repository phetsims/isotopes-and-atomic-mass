// Copyright 2015-2020, University of Colorado Boulder

/**
 * A particle bucket that can only contain one configuration of isotope, though it may contain multiple instances
 * of that isotope.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import MovableAtom from './MovableAtom.js';

class MonoIsotopeBucket extends SphereBucket {

  /**
   * @param {number} numProtonsInIsotope
   * @param {number} numNeutronsInIsotope
   * @param {Object} [options]
   */
  constructor( numProtonsInIsotope, numNeutronsInIsotope, options ) {
    super( options );

    this.numProtonsInIsotope = numProtonsInIsotope; // @public
    this.numNeutronsInIsotope = numNeutronsInIsotope; // @public
  }

  /**
   * Add an isotope to the first open position in the bucket.
   *
   * @param {MovableAtom} isotope
   * @param {boolean} moveImmediately
   *
   * @public
   */
  addIsotopeInstanceFirstOpen( isotope, moveImmediately ) {
    if ( this.isIsotopeAllowed( isotope.atomConfiguration.protonCount, isotope.atomConfiguration.neutronCount ) ) {
      this.addParticleFirstOpen( isotope, moveImmediately );
    }
  }

  /**
   * Tests to see if an isotope matches the MonoIsotopeBucket.
   *
   * @param {number} numProtons
   * @param {number} numNeutrons
   * @returns {boolean}
   *
   * @public
   */
  isIsotopeAllowed( numProtons, numNeutrons ) {
    return this.numProtonsInIsotope === numProtons && this.numNeutronsInIsotope === numNeutrons;
  }

  /**
   * Add an isotope to the nearest open position in the bucket.
   *
   * @param {MovableAtom} isotope
   * @param {boolean} animate
   *
   * @public
   */
  addIsotopeInstanceNearestOpen( isotope, animate ) {
    if ( this.isIsotopeAllowed( isotope.atomConfiguration.protonCount, isotope.atomConfiguration.neutronCount ) ) {
      this.addParticleNearestOpen( isotope, animate );
    }
  }

  /**
   * Get a list of all isotopes contained within this bucket.
   * @returns {ObservableArrayDef} containedIsotopes
   *
   * @public
   */
  getContainedIsotopes() {
    const containedIsotopes = createObservableArray();
    this.getParticleList().forEach( isotope => {
      assert && assert( isotope instanceof MovableAtom );
      containedIsotopes.push( isotope );
    } );

    return containedIsotopes;
  }
}

isotopesAndAtomicMass.register( 'MonoIsotopeBucket', MonoIsotopeBucket );
export default MonoIsotopeBucket;
