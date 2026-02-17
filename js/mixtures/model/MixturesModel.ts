// Copyright 2014-2026, University of Colorado Boulder

/**
 * MixturesModel is the main model class for the "Mixtures" screen. This model allows the user to experiment with
 * different mixtures of isotopes for a given element, and to compare their created mixtures to nature's mixture.  They
 * do this by moving atoms into and out of a test chamber. The model keeps track of which isotopes are in the test
 * chamber and tracks the average atomic mass of the mixture in the chamber.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 * @author Aadish Gupta
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopeTestChamber, { IsotopeTestChamberState } from './IsotopeTestChamber.js';
import MonoIsotopeBucket from './MonoIsotopeBucket.js';
import NucleusConfig from './NucleusConfig.js';
import NumericalIsotopeQuantityControl from './NumericalIsotopeQuantityControl.js';
import PositionableAtom from './PositionableAtom.js';

// constants
const BUCKET_SIZE = new Dimension2( 120, 50 ); // Size of the buckets that will hold the isotopes.

// Within this model, the isotopes come in two sizes, small and large, and atoms are either one size or another,
// and all atoms that are shown at a given time are all the same size. The larger size is based somewhat on reality.
// The smaller size is used when we want to show a lot of atoms at once.
const LARGE_ISOTOPE_RADIUS = 10;
const SMALL_ISOTOPE_RADIUS = 4;
const NUM_LARGE_ISOTOPES_PER_BUCKET = 10; // Numbers of isotopes that are placed into the buckets

// Enum type of the possible interactivity types. The user is dragging large isotopes between the test chamber and a set
// of buckets. The user is adding and removing small isotopes to/from the chamber using sliders.
export const interactivityModeValues = [ 'bucketsAndLargeAtoms', 'slidersAndSmallAtoms' ] as const;
export type InteractivityModeType = typeof interactivityModeValues[number];

// constants
const NUM_NATURES_MIX_ATOMS = 1000; // total number of atoms placed in the chamber when depicting nature's mix

class MixturesModel {

  // The proton count of the element that is currently being worked with. This is used to determine which isotopes are
  // available for the user to work with.  Setting this value is how the current element is changed.
  public selectedElementProtonCountProperty: NumberProperty;

  // The mode through which the user is controlling the set of isotope instances in the test chamber, either through the
  // buckets (smaller quantities) or the sliders (larger quantities).
  public readonly interactivityModeProperty = new Property<InteractivityModeType>( 'bucketsAndLargeAtoms' );

  // The list of isotopes that exist in nature as variations of the current "prototype isotope". In other words, this
  // contains a list of all stable isotopes that match the atomic number of the currently configured isotope. There
  // should be only one of each possible isotope.
  public readonly possibleIsotopesProperty = new Property<NucleusConfig[]>( [] );

  // A Property that indicates whether "Nature's Mix" is being shown or the user-created mix.
  public readonly showingNaturesMixProperty = new Property<boolean>( false );

  // The test chamber into and out of which the isotopes can be moved.  Isotopes that are in the test chamber are
  // considered part of the current mixture and included in the average atomic mass calculation.
  public readonly testChamber = new IsotopeTestChamber();

  // The list of isotope buckets that are present in the model when the interactivity mode is 'bucketsAndLargeAtoms'.
  public readonly bucketList: ObservableArray<MonoIsotopeBucket>;

  // The list of movable isotopes that are present in the model, either in the test chamber or in the buckets.
  public readonly isotopesList: ObservableArray<PositionableAtom>;

  // The list of nature's isotopes that are present in the model when nature's mix is being shown.
  public readonly naturesIsotopesList: ObservableArray<PositionableAtom>;

  // The list of numerical controls that are currently present.  These allow the user to quickly add or remove isotopes.
  public readonly numericalControllerList: ObservableArray<NumericalIsotopeQuantityControl>;

  // This map will be used to store the user-created mix states for each element and for the two interactivity modes so
  // that they can be restored when the user switches between elements, modes, and showing nature's mix.
  private mapIsotopeConfigToUserMixState: Map<number, Map<InteractivityModeType, State>>;

  // An emitter that notifies listeners when nature's isotopes have been updated.  This is used so that the view can
  // essentially get one notification when all of nature's isotopes have been added to the test chamber instead of
  // hundreds of separate notifications.
  public readonly naturesIsotopeUpdated = new Emitter();

  /**
   * Constructor for the Mixtures Model
   **/
  public constructor() {

    // Start off with hydrogen as the default element, which has one proton.
    this.selectedElementProtonCountProperty = new NumberProperty( 1 );

    // Create the observable arrays that will hold the various model elements that come and go.
    this.bucketList = createObservableArray<MonoIsotopeBucket>();
    this.isotopesList = createObservableArray<PositionableAtom>();
    this.naturesIsotopesList = createObservableArray<PositionableAtom>();
    this.numericalControllerList = createObservableArray<NumericalIsotopeQuantityControl>();

    // Map of elements to user mixes. These are restored when switching between elements.
    this.mapIsotopeConfigToUserMixState = new Map<number, Map<InteractivityModeType, State>>();

    // Monitor the currently selected element and update other aspects of the model accordingly when changes occur.
    this.selectedElementProtonCountProperty.link( ( newProtonCount, previousProtonCount ) => {

      // Before changing anything else, save the current state for the previously selected element before transitioning
      // to the new one.
      if ( previousProtonCount !== null ) {
        this.saveState( previousProtonCount, this.interactivityModeProperty.value );
      }

      // Update the list of isotopes that are available for the new element.
      this.updatePossibleIsotopesList( newProtonCount );

      // Update the controllers (i.e. buckets or sliders) and the contents of the test chamber to match the new element.
      this.updateTestChamberAndControllers();
    } );

    // Listen to Property that indicates whether "Nature's Mix" is being shown and show/hide the appropriate isotopes
    // when the value changes. This doesn't need and unlink as it stays throughout the life of the sim.
    this.showingNaturesMixProperty.lazyLink( showingNaturesMix => {
      if ( showingNaturesMix ) {

        // Get the current user-created mix state.
        const usersMixState = this.getCurrentState();

        // We need to tweak this part of the state because we are transitioning to nature's mix.
        usersMixState.showingNaturesMix = false;

        // Save the user-created mix state so that it can be restored later if needed.
        let stateMapForProtonCount = this.mapIsotopeConfigToUserMixState.get(
          this.selectedElementProtonCountProperty.value
        );
        if ( !stateMapForProtonCount ) {

          // Nothing has been saved for this element yet, so create a new map to hold the states for the interactivity
          // modes.
          stateMapForProtonCount = new Map<InteractivityModeType, State>();
          this.mapIsotopeConfigToUserMixState.set(
            this.selectedElementProtonCountProperty.value,
            stateMapForProtonCount
          );
        }

        // Save the user-created mix state for the current interactivity mode.
        stateMapForProtonCount.set( this.interactivityModeProperty.get(), usersMixState );

        // Display nature's mix.
        this.showNaturesMix();
      }
      else {
        this.naturesIsotopesList.clear();

        // If there is a previously saved user-created mix state for this element and interactivity mode, restore it.
        if ( this.mapIsotopeConfigToUserMixState.has( this.selectedElementProtonCountProperty.value ) ) {

          const stateMapForProtonCount = this.mapIsotopeConfigToUserMixState.get(
            this.selectedElementProtonCountProperty.value
          )!;

          if ( stateMapForProtonCount ) {
            const state = stateMapForProtonCount.get( this.interactivityModeProperty.get() );
            if ( state ) {
              state.showingNaturesMix = false; // Prevent overwrite of nature's mix state.
              this.setState( state );
            }
          }
          else {
            this.setUpInitialUsersMix();
          }
        }
        else {
          this.setUpInitialUsersMix();
        }
      }
    } );

    // Listen to interactivity mode changes and update the model appropriately. This will save the current user-created
    // mix state for the current element and interactivity mode, and then restore any previously saved state for the
    // new interactivity mode. If no previous state is found, then the initial user-created mix will be set up.  This
    // doesn't need unlink as it stays throughout the sim life.
    this.interactivityModeProperty.lazyLink( ( interactivityMode, oldInteractivityMode ) => {

      // Get the current user-created mix state.
      const usersMixState = this.getCurrentState();
      usersMixState.interactivityMode = oldInteractivityMode;

      // Save the user-created mix state so that it can be restored later.
      let stateMapForProtonCount = this.mapIsotopeConfigToUserMixState.get(
        this.selectedElementProtonCountProperty.value
      );
      if ( !stateMapForProtonCount ) {

        // Nothing has been saved for this element yet, so create a new map to hold the states for the interactivity
        // modes.
        stateMapForProtonCount = new Map<InteractivityModeType, State>();
        this.mapIsotopeConfigToUserMixState.set( this.selectedElementProtonCountProperty.value, stateMapForProtonCount );
      }
      stateMapForProtonCount.set( oldInteractivityMode, usersMixState );

      // See if there is a previously saved user-created mix state for this element and interactivity mode and restore
      // it if found.
      if ( this.mapIsotopeConfigToUserMixState.has( this.selectedElementProtonCountProperty.value ) ) {
        stateMapForProtonCount = this.mapIsotopeConfigToUserMixState.get(
          this.selectedElementProtonCountProperty.value
        )!;
        const state = stateMapForProtonCount.get( interactivityMode );
        if ( state ) {
          this.setState( state );
        }
        else {

          // No previous state found, so set up the initial state.
          this.removeAllIsotopesFromTestChamberAndModel();
          this.addIsotopeControllers();
        }
      }
    } );
  }

  /**
   * Main model step function, called by the framework.
   */
  public step( dt: number ): void {

    // Update particle positions.
    this.isotopesList.forEach( isotope => {
      isotope.step( dt );
    } );
  }

  /**
   * Decide whether to place an isotope into the test chamber or a bucket based on its current position, and then do
   * the placement.
   */
  private placeIsotope( isotope: PositionableAtom, bucket: MonoIsotopeBucket, testChamber: IsotopeTestChamber ): void {
    if ( testChamber.isIsotopePositionedOverChamber( isotope ) ) {
      testChamber.addParticle( isotope, true );
      testChamber.adjustForOverlap();
    }
    else {
      bucket.addIsotopeInstanceNearestOpen( isotope, true );
    }
  }

  /**
   * Create and add an isotope of the specified configuration.  Where the isotope is initially placed depends upon the
   * current interactivity mode.
   */
  private createAndAddIsotope( isotopeConfig: NucleusConfig, animate: boolean ): PositionableAtom | undefined {
    let newIsotope: PositionableAtom | undefined;
    if ( this.interactivityModeProperty.get() === 'bucketsAndLargeAtoms' ) {

      // Create the specified isotope and add it to the appropriate bucket.
      newIsotope = new PositionableAtom(
        isotopeConfig.protonCount,
        isotopeConfig.neutronCount,
        new Vector2( 0, 0 )
      );

      const bucket = this.getBucketForIsotope( isotopeConfig );
      if ( bucket ) {
        bucket.addIsotopeInstanceFirstOpen( newIsotope, animate );

        // does not require unlink
        newIsotope.isDraggingProperty.link( isDragging => {
          if ( isDragging ) {
            if ( newIsotope!.containerProperty.value ) {

              // Remove the atom from its container, which will be either a bucket or the particle atom.
              newIsotope!.containerProperty.value.removeParticle( newIsotope! );
            }
          }
          else if ( !isDragging && !bucket.includes( newIsotope! ) ) {
            this.placeIsotope( newIsotope!, bucket, this.testChamber );
          }
        } );
        this.isotopesList.add( newIsotope );
      }
    }
    return newIsotope;
  }

  /**
   * Get the bucket where the given isotope can be placed.
   */
  public getBucketForIsotope( isotope: NucleusConfig ): MonoIsotopeBucket | null {
    let isotopeBucket: MonoIsotopeBucket | null = null;
    this.bucketList.forEach( bucket => {
      if ( bucket.isIsotopeAllowed( isotope.protonCount, isotope.neutronCount ) ) {
        isotopeBucket = bucket;
      }
    } );
    return isotopeBucket;
  }

  /**
   * Add newBucket to bucketList.
   */
  private addBucket( newBucket: MonoIsotopeBucket ): void {
    this.bucketList.push( newBucket );
  }

  /**
   * Set up the initial user's mix for the currently configured element. This should set all state variables to be
   * consistent with the display of the initial users mix. This is generally called the first time an element is
   * selected after initialization or reset.
   */
  public setUpInitialUsersMix(): void {
    this.removeAllIsotopesFromTestChamberAndModel();
    this.showingNaturesMixProperty.set( false );
    this.addIsotopeControllers();
  }

  /**
   * Get the current state of the model in a format that can be restored later.
   * @param selectedElementProtonCount - Proton count of the currently selected element, or null to use the current one
   *                                     from the model.  This parameter is used when saving the state when changing
   *                                     to a new element in order to capture the previous element's proton count.
   */
  private getCurrentState( selectedElementProtonCount: number | null = null ): State {

    // If any movable isotope instances are being dragged by the user at this moment, we need to force that isotope
    // instance into a state that indicates that it isn't.  Otherwise, it can get lost, since it will neither be in a
    // bucket nor the test chamber.  This case can only occur in multitouch situations, see
    // https://github.com/phetsims/isotopes-and-atomic-mass/issues/101.
    const userControlledMovableIsotopes = this.isotopesList.filter( isotope => isotope.isDraggingProperty.value );
    userControlledMovableIsotopes.forEach( isotope => {
      isotope.isDraggingProperty.set( false );
    } );

    return new State( this, selectedElementProtonCount );
  }

  /**
   * Set the state of the model based on a previously created state representation.  This is used when switching between
   * elements and interactivity modes, since each element and mode can have its own user-created state.
   */
  private setState( modelState: State ): void {

    // Clear out any particles that are currently in the test chamber.
    this.removeAllIsotopesFromTestChamberAndModel();

    // Restore the selected element.
    this.selectedElementProtonCountProperty.value = modelState.selectedElementProtonCount;
    this.updatePossibleIsotopesList( modelState.selectedElementProtonCount );

    // Restore the nature's mix setting.
    this.showingNaturesMixProperty.set( modelState.showingNaturesMix );

    // Add any particles that were in the test chamber.
    this.testChamber.setState( modelState.isotopeTestChamberState );
    this.testChamber.containedIsotopes.forEach( isotope => {
      this.isotopesList.add( isotope );
    } );

    // Add the appropriate isotope controllers. This will create the controllers in their initial states.
    this.addIsotopeControllers();

    // Set up the isotope controllers to match whatever is in the test chamber.
    if ( this.interactivityModeProperty.get() === 'bucketsAndLargeAtoms' ) {

      // The code above created the buckets in their initial states, but we need to set them to match the saved state.
      // The first step is to remove the buckets that were just created and the isotopes they contained.
      this.bucketList.forEach( bucket => {
        const particlesInThisBucket = bucket.getParticleList();
        particlesInThisBucket.forEach( isotope => {
          this.isotopesList.remove( isotope );
        } );
      } );
      this.removeBuckets();

      // Add the buckets and the isotope instances they contain based on the provided state.
      modelState.bucketList.forEach( bucket => {
        this.bucketList.add( bucket );
        const particlesInThisBucket = modelState.bucketToParticleListMap.get( bucket ) || [];
        particlesInThisBucket.forEach( isotope => {
          this.isotopesList.add( isotope );
          bucket.addParticleFirstOpen( isotope, false );
        } );
      } );
    }
  }

  /**
   * Save the current user-created mix state for the specified element and interactivity mode.
   */
  private saveState( elementProtonCount: number, interactivityMode: InteractivityModeType ): void {

    const currentState = this.getCurrentState( elementProtonCount );

    const stateMapForProtonCount = this.mapIsotopeConfigToUserMixState.get( elementProtonCount );
    if ( stateMapForProtonCount ) {

      // Update the saved state for the current interactivity mode.
      stateMapForProtonCount.set( interactivityMode, currentState );
    }
    else {

      // Nothing has been saved for this element yet, so create a new map to hold the states for the interactivity
      // modes.
      const newStateMapForProtonCount = new Map<InteractivityModeType, State>();
      newStateMapForProtonCount.set( interactivityMode, currentState );
      this.mapIsotopeConfigToUserMixState.set( elementProtonCount, newStateMapForProtonCount );
    }
  }

  /**
   * Make the state of the test chamber and controllers match the current model state.  Be careful not to call this
   * unnecessarily, since it can be expensive.
   */
  private updateTestChamberAndControllers(): void {

    // convenience variable
    const selectedElementProtonCount = this.selectedElementProtonCountProperty.value;

    if ( this.showingNaturesMixProperty.value ) {
      this.removeAllIsotopesFromTestChamberAndModel();
      this.updatePossibleIsotopesList( selectedElementProtonCount );
      this.showNaturesMix();
    }
    else {

      const savedState = this.mapIsotopeConfigToUserMixState.get( selectedElementProtonCount )?.get(
        this.interactivityModeProperty.get()
      );

      if ( savedState ) {
        this.setState( savedState );
      }
      else {

        // Set initial default state for this isotope configuration.
        this.removeAllIsotopesFromTestChamberAndModel();
        this.updatePossibleIsotopesList( selectedElementProtonCount );

        // Set all model elements for the first time this element's user mix is shown.
        this.setUpInitialUsersMix();
      }
    }
  }

  /**
   * Update the list of the possible isotopes based on the provided element, sorted from lightest to heaviest.
   * @param elementProtonCount - the proton count of the element for which the possible isotopes list should be updated.
   */
  private updatePossibleIsotopesList( elementProtonCount: number ): void {
    const stableIsotopes = AtomIdentifier.getStableIsotopesOfElement( elementProtonCount );
    const newIsotopesList: NucleusConfig[] = [];
    Object.entries( stableIsotopes ).forEach( ( [ index, isotope ] ) => {
      newIsotopesList.push( new NucleusConfig( isotope[ 0 ], isotope[ 1 ] ) );
    } );

    // Sort from lightest to heaviest. Do not change this without careful consideration, since several areas of the
    // code count on this. This is kept in case someone adds another isotope to AtomIdentifier and doesn't add it
    // in order.
    newIsotopesList.sort( ( atom1, atom2 ) => atom1.getAtomicMass() - atom2.getAtomicMass() );

    // Update the list of possible isotopes for this atomic configuration.
    this.possibleIsotopesProperty.set( newIsotopesList );
  }

  /**
   * Remove all buckets that are currently in the model, as well as the particles they contained.
   */
  public removeBuckets(): void {
    this.bucketList.forEach( bucket => {
      bucket.reset();
    } );
    this.bucketList.clear();
  }

  /**
   * Set up the appropriate isotope controllers based on the currently selected element, the interactivity mode, and
   * the mix setting (i.e. user's mix or nature's mix). This will remove any existing controllers. This will also add
   * the appropriate initial number of isotopes to any buckets that are created.
   */
  public addIsotopeControllers(): void {

    // Remove existing controllers.
    this.removeBuckets();
    this.removeNumericalControllers();

    const buckets = this.interactivityModeProperty.get() === 'bucketsAndLargeAtoms' ||
                    this.showingNaturesMixProperty.get();

    // Set up layout variables.
    const controllerYOffsetBucket = -250; // empirically determined
    const controllerYOffsetSlider = -238; // empirically determined
    let interControllerDistanceX: number;
    let controllerXOffset: number;
    if ( this.possibleIsotopesProperty.get().length < 4 ) {

      // We can fit 3 or less cleanly under the test chamber.
      interControllerDistanceX = this.testChamber.getTestChamberRect().getWidth() / this.possibleIsotopesProperty.get().length;
      controllerXOffset = this.testChamber.getTestChamberRect().minX + interControllerDistanceX / 2;
    }
    else {

      // Four controllers don't fit well under the chamber, so use a positioning algorithm where they are extended
      // a bit to the right.
      interControllerDistanceX = ( this.testChamber.getTestChamberRect().getWidth() * 1.10 ) /
                                 this.possibleIsotopesProperty.get().length;
      controllerXOffset = -180;
    }

    // Add the controllers.
    for ( let i = 0; i < this.possibleIsotopesProperty.get().length; i++ ) {
      const isotopeConfig = this.possibleIsotopesProperty.get()[ i ];

      const isotopeCaptionStringProperty = new DerivedStringProperty(
        [ AtomIdentifier.getName( isotopeConfig.protonCount ) ],
        ( name: string ) => `${name}-${isotopeConfig.getMassNumber()}`
      );

      if ( buckets ) {
        const newBucket = new MonoIsotopeBucket(
          isotopeConfig.protonCount,
          isotopeConfig.neutronCount,
          {
            position: new Vector2( controllerXOffset + interControllerDistanceX * i, controllerYOffsetBucket ),
            size: BUCKET_SIZE,
            captionText: isotopeCaptionStringProperty,
            sphereRadius: LARGE_ISOTOPE_RADIUS
          }
        );
        this.addBucket( newBucket );
        if ( !this.showingNaturesMixProperty.get() ) {

          // Create and add initial isotopes to the new bucket.
          for ( let j = 0; j < NUM_LARGE_ISOTOPES_PER_BUCKET; j++ ) {
            this.createAndAddIsotope( isotopeConfig, false );
          }
        }
      }
      else {

        // assume a numerical controller
        const newController = new NumericalIsotopeQuantityControl(
          this,
          isotopeConfig,
          new Vector2( controllerXOffset + interControllerDistanceX * i, controllerYOffsetSlider ),
          isotopeCaptionStringProperty
        );

        // Create a small isotope instance to be used in the controller as a sort of icon.
        newController.controllerIsotope = new PositionableAtom(
          isotopeConfig.protonCount,
          isotopeConfig.neutronCount,
          new Vector2( 0, 0 ),
          { particleRadius: SMALL_ISOTOPE_RADIUS }
        );

        this.numericalControllerList.add( newController );
      }
    }
  }

  public removeNumericalControllers(): void {
    this.numericalControllerList.clear();
  }

  private showNaturesMix(): void {
    assert && assert( this.showingNaturesMixProperty.get() );

    // Clear out anything that is in the test chamber. If anything needed to be stored, it should have been done by now.
    this.removeAllIsotopesFromTestChamberAndModel();
    this.naturesIsotopesList.clear();

    // Get the list of possible isotopes and then sort it by abundance so that the least abundant are added last, thus
    // assuring that they will be visible.
    const possibleIsotopesCopy = this.possibleIsotopesProperty.get().slice( 0 );
    const numDigitsForComparison = 10;
    possibleIsotopesCopy.sort(
      ( atom1, atom2 ) => AtomIdentifier.getNaturalAbundance( atom2.toNumberAtom(), numDigitsForComparison ) -
                          AtomIdentifier.getNaturalAbundance( atom1.toNumberAtom(), numDigitsForComparison )
    );

    // Add the isotopes.
    possibleIsotopesCopy.forEach( isotopeConfig => {
      let numToCreate = roundSymmetric(
        NUM_NATURES_MIX_ATOMS * AtomIdentifier.getNaturalAbundance( isotopeConfig.toNumberAtom(), 5 )
      );
      if ( numToCreate === 0 ) {

        // The calculated quantity was 0, but we don't want to have zero instances of this isotope in the chamber, so
        // add only one. This behavior was requested by the design team.
        numToCreate = 1;
      }
      const isotopesToAdd: PositionableAtom[] = [];
      for ( let i = 0; i < numToCreate; i++ ) {
        const newIsotope = new PositionableAtom(
          isotopeConfig.protonCount,
          isotopeConfig.neutronCount,
          this.testChamber.generateRandomPosition(),
          { particleRadius: SMALL_ISOTOPE_RADIUS }
        );

        isotopesToAdd.push( newIsotope );
        this.naturesIsotopesList.push( newIsotope );
      }
      this.testChamber.bulkAddIsotopesToChamber( isotopesToAdd );
    } );
    this.naturesIsotopeUpdated.emit();

    // Add the isotope controllers (i.e. the buckets).
    this.addIsotopeControllers();
  }

  /**
   * Remove all isotopes from the test chamber, and then remove them from the model. This method does not add removed
   * isotopes back to the buckets or update the controllers.
   */
  public removeAllIsotopesFromTestChamberAndModel(): void {

    // Remove the isotopes from the test chamber.
    this.testChamber.removeAllIsotopes();

    // Reset the buckets so that they don't have references to the particles.
    this.bucketList.forEach( bucket => {
      bucket.reset();
    } );

    // Clear the model-specific list of isotopes.
    this.isotopesList.clear();
  }

  public clearBox(): void {
    this.removeAllIsotopesFromTestChamberAndModel();
    this.addIsotopeControllers();
  }

  /**
   * Resets the model. Returns to the default settings.
   */
  public reset(): void {

    // Make sure there is nothing stored for the default element.  This is necessary so that no state is restored when
    // we set the default element.
    this.mapIsotopeConfigToUserMixState.delete( this.selectedElementProtonCountProperty.initialValue );

    this.clearBox();
    this.naturesIsotopesList.clear();
    this.interactivityModeProperty.reset();
    this.showingNaturesMixProperty.reset();

    // Reset the selected element.
    this.selectedElementProtonCountProperty.reset();

    // Remove all stored user-created mix states.  This must be done after setting the default element because state
    // could have been saved when the default was set.
    this.mapIsotopeConfigToUserMixState.clear();
  }
}

/**
 * Class that can be used to save the state of the model. This will be used for saving and restoring of the state when
 * switching between various modes.
 */
class State {
  public readonly selectedElementProtonCount: number;
  public readonly isotopeTestChamberState: IsotopeTestChamberState;
  public interactivityMode: InteractivityModeType;
  public showingNaturesMix: boolean;
  public readonly bucketList: MonoIsotopeBucket[];
  public readonly bucketToParticleListMap: Map<MonoIsotopeBucket, PositionableAtom[]>;

  /**
   * @param model - The model to create state from
   * @param selectedElementProtonCount - The proton count of the selected element.  If null, it will be taken from the
   *                                     model.  This is used when saving state as the selected element is changing so
   *                                     that the stored value is the correct one and not the updated one.
   */
  public constructor( model: MixturesModel, selectedElementProtonCount: number | null = null ) {

    this.selectedElementProtonCount = selectedElementProtonCount === null ?
                                      model.selectedElementProtonCountProperty.value :
                                      selectedElementProtonCount;
    this.isotopeTestChamberState = model.testChamber.getState();
    this.interactivityMode = model.interactivityModeProperty.value;
    this.showingNaturesMix = model.showingNaturesMixProperty.value;

    // Make sure none of the isotope instances are in a state where they are being dragged by the user.  In the vast
    // majority of cases, they won't be when the state is recorded, so this will be a no-op, but there are some multi-
    // touch scenarios where it is possible, and it is problematic to try to store them in this state.  The view will
    // cancel interactions anyway, but there is no guarantee that the cancellation will have happened at this point in
    // time, so we have to do this here to be sure.  See https://github.com/phetsims/isotopes-and-atomic-mass/issues/101.
    model.isotopesList.forEach( isotopeInstance => { isotopeInstance.isDraggingProperty.set( false ); } );

    // For the bucket state, we keep references to the actual buckets and particles that are being used.  This works for
    // this model because nothing else is done with a bucket after saving its state.  It is admittedly not very general,
    // but works fine for the needs of this model.  Note that we need to store the particle references separately so
    // that they can be added back during state restoration.
    this.bucketList = [ ...model.bucketList ];
    this.bucketToParticleListMap = new Map();
    model.bucketList.forEach( bucket => {
      const particlesInThisBucket = [ ...bucket.getParticleList() ];
      this.bucketToParticleListMap.set( bucket, particlesInThisBucket );
    } );
  }
}

isotopesAndAtomicMass.register( 'MixturesModel', MixturesModel );
export default MixturesModel;