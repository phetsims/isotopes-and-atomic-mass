// Copyright 2002-2015, University of Colorado

/**
 * This class is the model representation of a numerical controller that
 * allows the user to add or remove isotopes from the test chamber.  It is
 * admittedly a little odd to have a class like this that is really more
 * of a view sort of thing, but it was needed in order to be consistent
 * with the buckets, which are the other UI device that the user has for
 * moving isotopes into and out of the test chamber.  The buckets must
 * have a presence in the model so that the isotopes that are outside of
 * the chamber have somewhere to go, so this class allows buckets and
 * other controls to be handled consistently between the model and view.
 *
 * @author James Smith
 * @author Jesse Greenberg
 */


define( function( require ) {
  'use strict';
  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );
  var MovableAtom = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MovableAtom' );

  // Global Variables
  var CAPACITY = 100;

  function NumericalIsotopeQuantityControl( model, isotopeConfig, position ) {

    this.quantityProperty = new Property( 0 );
    this.model = model;
    this.isotopeConfig = new NumberAtom( 0, 0, 0 );
    this.centerPosition = new Vector2( 0, 0 );
    this.centerPosition = position;

    // This property tracks whether this model element is still a part
    // of the active model, such that it should be displayed in the view.
    //TODO Changed to globally accessible variable, make sure this is ok.
    this.partOfModelProperty = new Property( true );
  }

  return inherit( Object, NumericalIsotopeQuantityControl, {

    getCapacity: function() {
      return CAPACITY;
    },

    /**
     * Notify this model element that it has been removed from the model.
     * This will result in notifications being sent that should cause view
     * elements to be removed from the view.
     */
    removedFromModel: function() {
      this.partOfModelProperty.set( false );
    },

    /**
     * Set the quantity of the isotope associated with this control to the
     * specified value.
     *
     * @param targetQuantity
     * @return
     */
    setIsotopeQuantity: function( targetQuantity ) {
      assert && assert( targetQuantity <= CAPACITY );
      var changeAmount = targetQuantity - this.model.getIsotopeTestChamber().getIsotopeCount( this.isotopeConfig );

      if ( changeAmount > 0 ) {
        for ( var i = 0; i < changeAmount; i++ ) {
          var newIsotope = new MovableAtom( this.isotopeConfig.protonCount, this.isotopeConfig.neutronCount,
            this.model.SMALL_ISOTOPE_RADIUS, this.model.getIsotopeTestChamber().generateRandomLocation() );

          this.model.getIsotopeTestChamber().addIsotopeToChamber( newIsotope, true );
          // this.model.notifyIsotopeInstanceAdded( newIsotope );

        }

      }

      else if ( changeAmount < 0 ) {
        for ( var j = 0; j < -changeAmount; j++ ) {
          var isotope = this.model.getIsotopeTestChamber().removeIsotopeMatchingConfig( this.isotopeConfig );
          if ( isotope !== null ) {
            isotope.removedFromModel();
          }
        }

      }

      this.quantityProperty = targetQuantity;

    },

    /**
     * Force the quantity property to sync up with the test chamber.
     * TODO Make sure that this method is not accessible to user (was listed as protected in old version)
     */
    syncToTestChamber: function() {
      this.quantityProperty = this.model.getIsotopeTestChamber().getIsotopeCount( this.isotopeConfig );
    },

    /**
     * @return
     */
    getBaseColor: function() {
      return this.model.getColorForIsotope( this.isotopeConfig );
    },

    getQuantity: function() {
      // Verify that the internal property matches that of the test chamber.
      assert && assert( this.quantityProperty === this.model.getIsotopeTestChamber().getIsotopeCount( this.isotopeConfig ) );
      // Return the value.
      return this.quantityProperty;
    }

  } );

} )
;


