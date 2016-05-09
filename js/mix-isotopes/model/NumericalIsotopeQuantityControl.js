// Copyright 2015, University of Colorado Boulder

/**
 * This class is the model representation of a numerical controller that allows the user to add or remove isotopes from
 * the test chamber. It is admittedly a little odd to have a class like this that is really more of a view sort of thing,
 * but it was needed in order to be consistent with the buckets, which are the other UI device that the user has for
 * moving isotopes into and out of the test chamber. The buckets must have a presence in the model so that the isotopes
 * that are outside of the chamber have somewhere to go, so this class allows buckets and other controls to be handled
 * consistently between the model and view.
 *
 * @author James Smith
 * @author Jesse Greenberg
 */


define( function( require ) {
  'use strict';
  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var MovableAtom = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MovableAtom' );
  var Property = require( 'AXON/Property' );

  // constants
  var CAPACITY = 100;

  /**
   * @param {MixIsotopesModel} model
   * @param {NumberAtom} isotopeConfig
   * @param {Vector2} position
   * @param {String} caption
   * @constructor
   */
  function NumericalIsotopeQuantityControl( model, isotopeConfig, position, caption ) {

    this.quantityProperty = new Property( model.testChamber.getIsotopeCount( isotopeConfig ) ); // @public
    this.model = model; // @private
    this.isotopeConfig = isotopeConfig; // @public
    this.centerPosition = position; // @public
    this.caption = caption; // @public
  }

  isotopesAndAtomicMass.register( 'NumericalIsotopeQuantityControl', NumericalIsotopeQuantityControl );
  return inherit( Object, NumericalIsotopeQuantityControl, {

    /**
     * Set the quantity of the isotope associated with this control to the specified value.
     *
     * @param {number} targetQuantity
     *
     * @public
     */
    setIsotopeQuantity: function( targetQuantity ) {
      assert && assert( targetQuantity <= CAPACITY );
      var changeAmount = targetQuantity - this.model.testChamber.getIsotopeCount( this.isotopeConfig );

      if ( changeAmount > 0 ) {
        for ( var i = 0; i < changeAmount; i++ ) {
          var newIsotope = new MovableAtom( this.isotopeConfig.protonCount, this.isotopeConfig.neutronCount,
            this.model.testChamber.generateRandomLocation() );
          newIsotope.color = this.model.getColorForIsotope( this.isotopeConfig );
          newIsotope.massNumber = this.isotopeConfig.massNumber;
          newIsotope.protonCount = this.isotopeConfig.protonCount;
          newIsotope.radius = 4;
          newIsotope.showLabel = false;
          this.model.testChamber.addIsotopeToChamber( newIsotope, true );
          this.model.isotopesList.add( newIsotope );
        }
      }
      else if ( changeAmount < 0 ) {
        for ( var j = 0; j < -changeAmount; j++ ) {
          var isotope = this.model.testChamber.removeIsotopeMatchingConfig( this.isotopeConfig );
          if ( isotope !== null ) {
            this.model.isotopesList.remove( isotope );
          }
        }
      }
    },

    // @public
    getBaseColor: function() {
      return this.model.getColorForIsotope( this.isotopeConfig );
    },

    // @public
    getQuantity: function() {
      // Verify that the internal property matches that of the test chamber.
      assert && assert( this.quantityProperty === this.model.testChamber.getIsotopeCount( this.isotopeConfig ) );
      // Return the value.
      return this.quantityProperty;
    }
  } );
} );