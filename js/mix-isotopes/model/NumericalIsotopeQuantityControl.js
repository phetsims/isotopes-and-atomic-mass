// Copyright 2015-2020, University of Colorado Boulder

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

import Property from '../../../../axon/js/Property.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import MovableAtom from './MovableAtom.js';

// constants
const CAPACITY = 100;

class NumericalIsotopeQuantityControl {

  /**
   * @param {MixIsotopesModel} model
   * @param {NumberAtom} isotopeConfig
   * @param {Vector2} position
   * @param {string} caption
   */
  constructor( model, isotopeConfig, position, caption ) {

    this.quantityProperty = new Property( model.testChamber.getIsotopeCount( isotopeConfig ) ); // @public
    this.model = model; // @private
    this.isotopeConfig = isotopeConfig; // @public
    this.centerPosition = position; // @public
    this.caption = caption; // @public
  }

  /**
   * Set the quantity of the isotope associated with this control to the specified value.
   *
   * @param {number} targetQuantity
   *
   * @public
   */
  setIsotopeQuantity( targetQuantity ) {
    assert && assert( targetQuantity <= CAPACITY );
    const changeAmount = targetQuantity - this.model.testChamber.getIsotopeCount( this.isotopeConfig );

    if ( changeAmount > 0 ) {
      for ( let i = 0; i < changeAmount; i++ ) {
        const newIsotope = new MovableAtom( this.isotopeConfig.protonCountProperty.get(),
          this.isotopeConfig.neutronCountProperty.get(),
          this.model.testChamber.generateRandomPosition() );
        newIsotope.color = this.model.getColorForIsotope( this.isotopeConfig );
        newIsotope.massNumber = this.isotopeConfig.massNumberProperty.get();
        newIsotope.protonCount = this.isotopeConfig.protonCountProperty.get();
        newIsotope.radiusProperty.set( 4 );
        newIsotope.showLabel = false;
        this.model.testChamber.addIsotopeToChamber( newIsotope, true );
        this.model.isotopesList.add( newIsotope );
      }
    }
    else if ( changeAmount < 0 ) {
      for ( let j = 0; j < -changeAmount; j++ ) {
        const isotope = this.model.testChamber.removeIsotopeMatchingConfig( this.isotopeConfig );
        if ( isotope !== null ) {
          this.model.isotopesList.remove( isotope );
        }
      }
    }
  }

  // @public
  getBaseColor() {
    return this.model.getColorForIsotope( this.isotopeConfig );
  }

  // @public
  getQuantity() {
    // Verify that the internal property matches that of the test chamber.
    assert && assert( this.quantityProperty === this.model.testChamber.getIsotopeCount( this.isotopeConfig ) );
    // Return the value.
    return this.quantityProperty;
  }
}

isotopesAndAtomicMass.register( 'NumericalIsotopeQuantityControl', NumericalIsotopeQuantityControl );
export default NumericalIsotopeQuantityControl;
