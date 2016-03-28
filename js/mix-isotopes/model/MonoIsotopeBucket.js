// Copyright 2015, University of Colorado Boulder

/**
 * A particle bucket that can only contain one configuration of isotope, though it may contain multiple instances
 * of that isotope.
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
  var MovableAtom = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MovableAtom' );

  /**
   * Constructor.
   * @param {Vector2} position
   * @param {Dimension2} size
   * @param {Color} baseColor
   * @param {String} caption
   * @param {number} particleRadius
   * @param {number} numProtonsInIsotope
   * @param {number} numNeutronsInIsotope
   */
  function MonoIsotopeBucket( position, size, baseColor, caption, particleRadius, numProtonsInIsotope, numNeutronsInIsotope ) {
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
     * @param {boolean} moveImmediately
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
     */
    isIsotopeAllowed: function( numProtons, numNeutrons ) {
      return this.numProtonsInIsotope === numProtons && this.numNeutronsInIsotope === numNeutrons;
    },

    /**
     * Add an isotope to the nearest open location in the bucket.
     *
     * @param {MovableAtom} isotope
     * @param {boolean} animate
     */
    addIsotopeInstanceNearestOpen: function( isotope, animate ) {
      if ( this.isIsotopeAllowed( isotope.atomConfiguration.protonCount, isotope.atomConfiguration.neutronCount ) ) {
        this.addParticleNearestOpen( isotope, animate );
      }
    },

    /**
     * Get a list of all isotopes contained within this bucket.
     * @return {ObservableArray} containedIsotopes
     */
    getContainedIsotopes: function() {
      var containedIsotopes = new ObservableArray();
      this.getParticleList().forEach( function( isotope ) {
        assert && assert( isotope instanceof MovableAtom );
        containedIsotopes.push( isotope );
      } );

      return containedIsotopes;
    }
  } );
} );