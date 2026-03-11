// Copyright 2015-2026, University of Colorado Boulder

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
 * @author John Blanco (PhET Interactive Simulations)
 */

import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import AtomConfig from '../../../../shred/js/model/AtomConfig.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import MixturesModel from './MixturesModel.js';
import PositionableAtom from './PositionableAtom.js';

// constants
const CAPACITY = 100;

class NumericalIsotopeQuantityControl {

  public readonly quantityProperty: Property<number>;
  private readonly model: MixturesModel;
  public readonly centerPosition: Vector2;
  public readonly controllerIsotope?: PositionableAtom;
  public readonly captionProperty: TReadOnlyProperty<string>;
  private readonly isotopeConfig: AtomConfig;

  /**
   * @param model - The main model for mixtures
   * @param isotopeConfig - Configuration for the isotope controlled by this control
   * @param position - Position of the control in model coordinates
   */
  public constructor( model: MixturesModel, isotopeConfig: AtomConfig, position: Vector2 ) {

    this.quantityProperty = new Property<number>( model.testChamber.getIsotopeCount( isotopeConfig ) );
    this.model = model;
    this.isotopeConfig = isotopeConfig;
    this.centerPosition = position;
    this.captionProperty = new DerivedStringProperty(
      [ AtomIdentifier.getName( isotopeConfig.protonCount ) ],
      ( name: string ) => `${name}-${isotopeConfig.getMassNumber()}`
    );

    // Create a small isotope instance to be used in the controller as a sort of icon.
    this.controllerIsotope = new PositionableAtom( isotopeConfig, new Vector2( 0, 0 ), {
      particleRadius: MixturesModel.SMALL_ISOTOPE_RADIUS
    } );
  }

  /**
   * Set the quantity of the isotope associated with this control to the specified value.
   */
  public setIsotopeQuantity( targetQuantity: number ): void {
    assert && assert( targetQuantity <= CAPACITY );
    const changeAmount = targetQuantity - this.model.testChamber.getIsotopeCount( this.isotopeConfig );

    if ( changeAmount > 0 ) {
      for ( let i = 0; i < changeAmount; i++ ) {
        const newAtom = new PositionableAtom( this.isotopeConfig, this.model.testChamber.generateRandomPosition(), {
          particleRadius: 4
        } );
        this.model.testChamber.addParticle( newAtom );
        this.model.isotopesList.add( newAtom );
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

  /**
   * release memory references
   */
  public dispose(): void {
    this.captionProperty.dispose();
  }
}

isotopesAndAtomicMass.register( 'NumericalIsotopeQuantityControl', NumericalIsotopeQuantityControl );
export default NumericalIsotopeQuantityControl;