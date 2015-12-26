// Copyright 2015, University of Colorado Boulder

/**
 *
 * A particle bucket that can only contain one configuration of isotope,
 * though it may contain multiple instances of that isotope.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

define( function( require ) {
  'use strict';

  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  var ObservableArray = require( 'AXON/ObservableArray' );

  //TODO Check and see if we actually need these
  // TODO Should I be using numberAtom instead of movable atom?
  var MovableAtom = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MovableAtom' );
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );

  /**
   * Constructor.
   * @param {Vector2} position
   * @param {Dimension2} size
   * @param {Color} color
   * @param {String} caption
   * @param {number} particleRadius
   * @param {number} numProtonsInIsotope
   * @param {number} numNeutronsInIsotope
   */
  function MonoIsotopeBucket( position, size, baseColor, caption, particleRadius, numProtonsInIsotope, numNeutronsInIsotope ) {
    // call the supertype
    SphereBucket.call( this, {
      position: position,
      size: size,
      baseColor: baseColor,
      caption: caption,
      sphereRadius: particleRadius
    } );

    this.numProtonsInIsotope = numProtonsInIsotope;
    this.numNeutronsInIsotope = numNeutronsInIsotope;

  }

  isotopesAndAtomicMass.register( 'MonoIsotopeBucket', MonoIsotopeBucket );
  return inherit( SphereBucket, MonoIsotopeBucket, {
    /**
     * Add an isotope to the first open location in the bucket.
     *
     * @param {MovableAtom} isotope
     * @param moveImmediately
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
     * TODO pick which of the following two functions to keep/ make sure in all instances of the second call switched to first version.
     * TODO Is there a more compact way to get protonCount and neutronCount?
     */

    isIsotopeAllowed: function( numProtons, numNeutrons ) {
      return this.numProtonsInIsotope === numProtons && this.numNeutronsInIsotope === numNeutrons;
    },

    /**
     *
     * @param {MovableAtom} isotopeConfig
     * @returns {*}
     */
    isIsotopeAllowedNumberAtom: function( isotopeConfig ) {
      return this.isIsotopeAllowed( isotopeConfig.atomConfiguration.protonCount, isotopeConfig.atomConfiguration.neutronCount );
    },

    /**
     * Add an isotope to the nearest open location in the bucket.
     *
     * @param {MovableAtom} isotope
     * @param {boolean} moveImmediately
     */
    addIsotopeInstanceNearestOpen: function( isotope, animate ) {
      if ( this.isIsotopeAllowed( isotope.atomConfiguration.protonCount, isotope.atomConfiguration.neutronCount ) ) {
        this.addParticleNearestOpen( isotope, animate );
      }
    },

    /**
     * Remove an isotope
     *
     * return {MovableAtom} isotopeToRemove
     */
    removeArbitraryIsotope: function() {
      var isotopeToRemove = null;

      if ( this.getParticleList().length > 0 ) {
        isotopeToRemove = this.getParticleList()[this.getParticleList().length - 1 ];
        this.removeParticle( isotopeToRemove );
      }

      else {
        // TODO is this the proper way to throw error?
        throw AtomIdentifier.getName( isotopeToRemove.atomConfiguration.protonCount ) + ' - Warning: Ignoring attempt to remove particle from empty bucket.';
      }
      return isotopeToRemove;
    },

    /**
     * Get a list of all isotopes contained within this bucket.
     * @return {ObservableArray} contained isotopes
     */
    getContainedIsotopes: function() {
      // TODO Should contained Isotopes here be an ObservableArray?
      var containedIsotopes = new ObservableArray();
      this.getParticleList().forEach( function( isotope ) {
        assert && assert( isotope instanceof MovableAtom );
        containedIsotopes.push( isotope );

      } );

      return containedIsotopes;
    }


  } );

} );