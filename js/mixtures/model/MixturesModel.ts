// Copyright 2014-2026, University of Colorado Boulder

/**
 * MixturesModel is the main model class for the "Mixtures" screen. This model allows the user to experiment with
 * different mixtures of isotopes for a given element, and to compare the mixtures they create to nature's mixture. They
 * do this by moving atoms into and out of a test chamber. The model keeps track of which isotopes are in the test
 * chamber and tracks the average atomic mass of the mixture in the chamber.
 *
 * @author John Blanco (PhET Interactive Simulations)
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
import Range from '../../../../dot/js/Range.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopeTestChamber from './IsotopeTestChamber.js';
import MonoIsotopeBucket from './MonoIsotopeBucket.js';
import NucleusConfig from './NucleusConfig.js';
import NumericalIsotopeQuantityControl from './NumericalIsotopeQuantityControl.js';
import PositionableAtom from './PositionableAtom.js';

// constants
const MAX_ATOMIC_NUMBER = 18;
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
export type InteractivityMode = typeof interactivityModeValues[number];

// constants
const NUM_NATURES_MIX_ATOMS = 1000; // total number of atoms placed in the chamber when depicting nature's mix

class MixturesModel {

  // The proton count of the element that is currently being worked with. This is used to determine which isotopes are
  // available for the user to work with.  Setting this value is how the current element is changed.
  public readonly selectedElementProtonCountProperty: NumberProperty;

  // The mode through which the user is controlling the set of isotope instances in the test chamber, either through the
  // buckets (smaller quantities) or the sliders (larger quantities).
  public readonly interactivityModeProperty = new Property<InteractivityMode>( 'bucketsAndLargeAtoms' );

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

  // Define the structure which will hold the particle state that the user has set up for an element.  This is an array
  // where the index corresponds to the atomic number of an element, and the map holds a set of particles that the user
  // put into the isotope test chamber for each interactivity mode.
  private readonly savedParticleStates: Map<InteractivityMode, PositionableAtom[]>[] = [];

  // An emitter that notifies listeners when nature's isotopes have been updated.  This is used so that the view can
  // essentially get one notification when all of nature's isotopes have been added to the test chamber instead of
  // hundreds of separate notifications.
  public readonly naturesIsotopeUpdated = new Emitter();

  public static readonly MAX_ATOMIC_NUMBER = MAX_ATOMIC_NUMBER;

  public constructor() {

    // Start off with hydrogen as the default element, which has one proton.
    this.selectedElementProtonCountProperty = new NumberProperty( 1, {
      range: new Range( 1, MAX_ATOMIC_NUMBER )
    } );

    // Create the observable arrays that will hold the various model elements that come and go.
    this.bucketList = createObservableArray<MonoIsotopeBucket>();
    this.isotopesList = createObservableArray<PositionableAtom>();
    this.naturesIsotopesList = createObservableArray<PositionableAtom>();
    this.numericalControllerList = createObservableArray<NumericalIsotopeQuantityControl>();

    // Initialize the structure for storing and then restoring user-created mix states.
    _.times( MAX_ATOMIC_NUMBER, index => {
      this.savedParticleStates[ index + 1 ] = new Map<InteractivityMode, PositionableAtom[]>();
    } );

    // Monitor the currently selected element and update other aspects of the model when changes occur. This uses the
    // `link` method so that things get set up initially.  This doesn't need an unlink as it stays throughout the life
    // of the sim.
    this.selectedElementProtonCountProperty.link( ( newProtonCount, previousProtonCount ) => {

      affirm(
        newProtonCount >= 1 && newProtonCount <= MAX_ATOMIC_NUMBER,
        `Proton count must be between 1 and ${MAX_ATOMIC_NUMBER}`
      );

      // Update the list of possible isotopes for the newly selected element.  A number of other model and view state
      // elements depend on this list, so we need to update it before doing anything else.
      this.updatePossibleIsotopesList( newProtonCount );

      if ( this.showingNaturesMixProperty.value ) {
        this.showNaturesMix( this.possibleIsotopesProperty.value );
      }
      else {

        // Before changing anything else, save the current state for the previously selected element before transitioning
        // to the new one.
        if ( previousProtonCount !== null ) {
          this.saveTestChamberParticleState( previousProtonCount, this.interactivityModeProperty.value );
        }

        // Remove all atoms - we will create the needed ones for the newly selected element below.
        this.removeAllIsotopesFromTestChamberAndModel();

        // If particle state information was previously saved for this element, add those particles back into the test
        // chamber.  This state information should exist if the user has switched to a different element and then switched
        // back, or if they have switched between the different interactivity modes for this element.
        this.restoreParticleState( newProtonCount, this.interactivityModeProperty.value );

        // Set up the controllers for the new element and current interactivity mode.
        this.setControllers( this.interactivityModeProperty.value );

        if ( this.interactivityModeProperty.value === 'bucketsAndLargeAtoms' ) {

          // Make sure the buckets contain the appropriate number of atoms based on the current state of the test chamber.
          this.fillBuckets();
        }
      }
    } );

    // Listen to the Property that indicates whether "Nature's Mix" is being shown and show/hide the appropriate isotope
    // instances when the value changes.  This doesn't need an unlink as it stays throughout the life of the sim.
    this.showingNaturesMixProperty.lazyLink( showingNaturesMix => {

      // Update the list of possible isotopes for the currently selected element.  During normal sim operation, this is
      // not needed in this handler, but because of the way phet-io state updates work, it's important to make sure this
      // is set correctly before doing any other state updates.
      this.updatePossibleIsotopesList( this.selectedElementProtonCountProperty.value );

      if ( showingNaturesMix ) {

        // Save the user-created mix state for the current element and interactivity mode before we switch to showing
        // nature's mix so that it can be restored when we switch back.
        this.saveTestChamberParticleState(
          this.selectedElementProtonCountProperty.value,
          this.interactivityModeProperty.value
        );

        // Display nature's mix.
        this.showNaturesMix( this.possibleIsotopesProperty.value );
      }
      else {
        this.naturesIsotopesList.clear();
        this.testChamber.removeAllIsotopes();

        // If there is a previously saved user-created mix state for this element and interactivity mode, restore it.
        this.restoreParticleState( this.selectedElementProtonCountProperty.value, this.interactivityModeProperty.value );

        // Set up the controllers for the new element and current interactivity mode.
        this.setControllers( this.interactivityModeProperty.value );

        if ( this.interactivityModeProperty.value === 'bucketsAndLargeAtoms' ) {

          // Make sure the buckets contain the appropriate number of atoms based on the current state of the test chamber.
          this.fillBuckets();
        }
      }
    } );

    // Listen to interactivity mode changes and update the model appropriately. This will save the current user-created
    // mix state for the current element and interactivity mode, and then restore any previously saved state for the
    // new interactivity mode.  This doesn't need an unlink as it stays throughout the sim life.
    this.interactivityModeProperty.lazyLink( ( interactivityMode, oldInteractivityMode ) => {

      // Update the list of possible isotopes for the currently selected element.  During normal sim operation, this is
      // not needed in this handler, but because of the way phet-io state updates work, it's important to make sure this
      // is set correctly before doing any other state updates.
      this.updatePossibleIsotopesList( this.selectedElementProtonCountProperty.value );

      // Save any user-created mix state for the interactivity mode that being changed out.
      this.saveTestChamberParticleState( this.selectedElementProtonCountProperty.value, oldInteractivityMode );

      // Remove all atoms - we will create the needed ones for the newly selected element below.
      this.removeAllIsotopesFromTestChamberAndModel();

      // Restore any previously saved user-created mix state for the new interactivity mode.
      this.restoreParticleState( this.selectedElementProtonCountProperty.value, interactivityMode );

      // Set up the controllers for the new interactivity mode.
      this.setControllers( interactivityMode );

      if ( interactivityMode === 'bucketsAndLargeAtoms' ) {

        // Make sure the buckets contain the appropriate number of atoms based on the current state of the test chamber.
        this.fillBuckets();
      }
    } );
  }

  /**
   * Main model step function, called by the framework.
   */
  public step( dt: number ): void {

    // Update particle positions.  This supports animations.
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
      testChamber.addParticle( isotope );

      // TODO REVIEW: addParticle is already correcting edge overlaps. Also, this method adjusts ALL particles, which seems
      //  inefficient. Consider removing entirely, since it's not used anywhere else. https://github.com/phetsims/isotopes-and-atomic-mass/issues/103
      testChamber.adjustForOverlap();
    }
    else {
      bucket.addIsotopeInstanceNearestOpen( isotope, true );
    }
  }

  /**
   * Add a drag listener to the provided atom instance so that when it is dragged out of the bucket it is removed from
   * the bucket and when it is dropped somewhere it is either added to the test chamber or put back in a bucket
   * depending on its position.
   */
  private addAtomDragListener( atom: PositionableAtom ): void {
    atom.isDraggingProperty.lazyLink( isDragging => {
      if ( isDragging ) {
        if ( atom.containerProperty.value ) {

          // Remove the atom from its container, which will be either a bucket or the test chamber.
          atom.containerProperty.value.removeParticle( atom );
        }
      }
      else {

        let destinationBucket: MonoIsotopeBucket | null = null;
        this.bucketList.forEach( bucket => {
          const config = bucket.isotopeConfigProperty.value;
          if ( config.protonCount === atom.atomConfigurationProperty.value.protonCount &&
               config.neutronCount === atom.atomConfigurationProperty.value.neutronCount ) {
            destinationBucket = bucket;
          }
        } );

        affirm( destinationBucket, 'No bucket found for atom config' );

        // This atom instance was being dragged and has now been dropped.  Place it in the appropriate
        // bucket or in the test chamber depending on where it was dropped.
        this.placeIsotope( atom, destinationBucket, this.testChamber );
      }
    } );
  }

  /**
   * Add newBucket to bucketList.
   */
  private addBucket( newBucket: MonoIsotopeBucket ): void {
    this.bucketList.push( newBucket );
  }

  /**
   * Remove all controllers, meaning the buckets and the numerical controllers.
   */
  private removeAllControllers(): void {
    this.removeNumericalControllers();
    this.removeBuckets();
  }

  /**
   * Save the current state of the particles in the test chamber for the currently selected element and interactivity
   * mode.  If there are no particles in the test chamber, nothing will be saved.  This is generally called when
   * switching between the various model configurations.
   */
  private saveTestChamberParticleState( protonCount: number, interactivityMode: InteractivityMode ): void {
    if ( this.testChamber.containedIsotopes.length > 0 ) {
      const particlesToSave = this.testChamber.containedIsotopes.slice( 0 );
      this.savedParticleStates[ protonCount ].set( interactivityMode, particlesToSave );
    }
  }

  /**
   * Restore the particles in the test chamber based on previously saved particle state for the given element and
   * interactivity mode.  If there is no saved state for the provided configuration, nothing will be restored, and this
   * will do nothing.
   */
  private restoreParticleState( elementProtonCount: number, interactivityMode: InteractivityMode ): void {
    const savedParticles = this.savedParticleStates[ elementProtonCount ].get( interactivityMode );
    if ( savedParticles ) {
      savedParticles.forEach( atom => {
        this.testChamber.addParticle( atom );
        this.isotopesList.add( atom );
      } );
    }
  }

  /**
   * Set up the controllers based on the provided element and interactivity mode.  This will remove any existing
   * controllers and add the appropriate new ones.
   */
  private setControllers( interactivityMode: InteractivityMode ): void {

    // Remove any existing controllers.
    this.removeAllControllers();

    // Add the appropriate controllers for this interactivity mode.
    if ( interactivityMode === 'bucketsAndLargeAtoms' ) {
      this.addBuckets( this.possibleIsotopesProperty.value );
    }
    else {
      affirm( interactivityMode === 'slidersAndSmallAtoms', 'Unexpected interactivity mode' );
      this.addNumericalControllers();
    }
  }

  /**
   * Add atoms to each of the currently active buckets so that the total number of atoms in the test chamber and buckets
   * matches the expected total number.
   */
  private fillBuckets(): void {
    affirm(
      this.interactivityModeProperty.value === 'bucketsAndLargeAtoms' && this.bucketList.length > 0,
      'the model is not in the correct state to fill the buckets'
    );

    // If the interactivity mode is bucketsAndLargeAtoms, we need to make sure the buckets contain the appropriate
    // number of atoms based on the current state of the test chamber.
    for ( let bucketIndex = 0; bucketIndex < this.bucketList.length; bucketIndex++ ) {
      const bucket = this.bucketList.get( bucketIndex );
      const isotopeConfig = bucket.isotopeConfigProperty.value;
      const isotopeCountInChamber = this.testChamber.getIsotopeCount( isotopeConfig );
      if ( isotopeCountInChamber < NUM_LARGE_ISOTOPES_PER_BUCKET ) {
        const numberToAdd = NUM_LARGE_ISOTOPES_PER_BUCKET - isotopeCountInChamber;
        for ( let i = 0; i < numberToAdd; i++ ) {
          const newAtom = new PositionableAtom(
            isotopeConfig.protonCount,
            isotopeConfig.neutronCount,
            new Vector2( 0, 0 )
          );
          this.isotopesList.add( newAtom );

          // Add the new isotope to the appropriate bucket.
          bucket.addIsotopeInstanceFirstOpen( newAtom );

          // Add a drag listener to each isotope instance so that when it is dragged out of the bucket it is removed
          // from the bucket and when it is dropped somewhere it is either added to the test chamber or put back in
          // a bucket depending on its position.
          this.addAtomDragListener( newAtom );
        }
      }
    }
  }

  /**
   * Update the list of the possible isotopes based on the provided element, sorted from lightest to heaviest.
   * @param elementProtonCount - the proton count of the element for which the possible isotopes list should be updated
   */
  private updatePossibleIsotopesList( elementProtonCount: number ): void {

    // Get the list of stable isotopes for the provided element and convert it to a list of NucleusConfigs.
    const stableIsotopes = AtomIdentifier.getStableIsotopesOfElement( elementProtonCount );
    const isotopesList: NucleusConfig[] = Object.values( stableIsotopes ).map(
      isotope => new NucleusConfig( isotope[ 0 ], isotope[ 1 ] )
    );

    // Sort from lightest to heaviest.
    isotopesList.sort( ( atom1, atom2 ) => atom1.getAtomicMass() - atom2.getAtomicMass() );

    this.possibleIsotopesProperty.set( isotopesList );
  }

  /**
   * Remove all buckets that are currently in the model, as well as the particles they contained.
   */
  private removeBuckets(): void {
    this.bucketList.forEach( bucket => {

      // Reset the bucket so that it doesn't have references to the particles, and then dispose it.
      bucket.reset();
      bucket.dispose();
    } );
    this.bucketList.clear();
  }

  /**
   * Get the X position for a controller based on its index and the total number of controllers. This is used to
   * position the controllers in model space.
   * @param controllerIndex - which controller this is, indexed from 0.
   * @param numControllers - the total number of controllers that need to be positioned, including this one.
   */
  private getControllerXOffset( controllerIndex: number, numControllers: number ): number {
    let interControllerDistanceX: number;
    let controllerXOffset: number;
    if ( numControllers < 4 ) {

      // We can fit 3 or less cleanly under the test chamber.
      interControllerDistanceX = this.testChamber.getTestChamberRect().getWidth() /
                                 this.possibleIsotopesProperty.value.length;
      controllerXOffset = this.testChamber.getTestChamberRect().minX + interControllerDistanceX / 2;
    }
    else {

      // Four controllers don't fit well under the chamber, so use a positioning algorithm where they are extended
      // a bit to the right.
      interControllerDistanceX = ( this.testChamber.getTestChamberRect().getWidth() * 1.10 ) /
                                 this.possibleIsotopesProperty.value.length;
      controllerXOffset = -180;
    }

    return controllerXOffset + interControllerDistanceX * controllerIndex;
  }

  /**
   * Add the buckets based on the provided list of isotopes.
   */
  private addBuckets( isotopes: NucleusConfig[] ): void {

    affirm( this.bucketList.length === 0, 'Buckets should have already been removed before adding new ones' );

    // Set up positioning variables.
    const yOffset = -250; // empirically determined to match design

    isotopes.forEach( ( isotopeConfig, index ) => {

      const newBucket = new MonoIsotopeBucket( isotopeConfig, {
        position: new Vector2( this.getControllerXOffset( index, isotopes.length ), yOffset ),
        size: BUCKET_SIZE,
        sphereRadius: LARGE_ISOTOPE_RADIUS
      } );
      this.addBucket( newBucket );
    } );
  }

  /**
   * Add the numerical controllers based on the current list of possible isotopes. This should only be called when the
   * interactivity mode is sliders and small atoms.
   */
  private addNumericalControllers(): void {
    const controllerYOffsetSlider = -238; // empirically determined to match design
    const numControllers = this.possibleIsotopesProperty.value.length;
    this.possibleIsotopesProperty.value.forEach( ( isotopeConfig, index ) => {

      const isotopeCaptionStringProperty = new DerivedStringProperty(
        [ AtomIdentifier.getName( isotopeConfig.protonCount ) ],
        ( name: string ) => `${name}-${isotopeConfig.getMassNumber()}`
      );

      const newController = new NumericalIsotopeQuantityControl(
        this,
        isotopeConfig,
        new Vector2( this.getControllerXOffset( index, numControllers ), controllerYOffsetSlider ),
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
    } );
  }

  /**
   * Remove the numerical controllers.
   */
  private removeNumericalControllers(): void {
    this.numericalControllerList.clear();
  }

  /**
   * Set up the test chamber to show nature's mix, which is a representation of the natural abundance of the isotopes for
   * the currently selected element.
   */
  private showNaturesMix( isotopeList: NucleusConfig[] ): void {

    affirm( this.showingNaturesMixProperty.value, 'Nature\'s mix should be showing to show nature\'s mix' );

    // Clear out anything that is in the test chamber. If anything needed to be stored, it should have been done by now.
    this.removeAllIsotopesFromTestChamberAndModel();
    this.naturesIsotopesList.clear();

    // Get the list of possible isotopes and then sort it by abundance so that the least abundant are added last, thus
    // assuring that they will be visible.
    const possibleIsotopesCopy = isotopeList.slice( 0 );
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

    // Add the isotope controllers (i.e. the buckets) for the selected element.  These are empty when nature's mix is
    // being shown, but we want to show them so that the user can see which isotopes are which.
    this.removeAllControllers();
    this.addBuckets( isotopeList );
  }

  /**
   * Remove all isotopes from the test chamber, and then remove them from the model. This method does not add removed
   * isotopes back to the buckets or update the controllers.
   */
  private removeAllIsotopesFromTestChamberAndModel(): void {

    // Remove the isotopes from the test chamber.
    this.testChamber.removeAllIsotopes();

    // Reset the buckets so that they don't have references to the particles.
    this.bucketList.forEach( bucket => {
      bucket.reset();
    } );

    // Clear the model-specific list of isotopes.
    this.isotopesList.clear();
  }

  /**
   * Remove all isotopes from the test chamber and make sure the controllers are updated correspondingly.  This was
   * implemented to support the eraser button, but may have other usages.
   */
  public clearTestChamber(): void {
    affirm( !this.showingNaturesMixProperty.value, 'Nature\'s mix should not be showing when clearing the box' );
    this.removeAllIsotopesFromTestChamberAndModel();
    if ( this.interactivityModeProperty.value === 'bucketsAndLargeAtoms' ) {
      this.fillBuckets();
    }
  }

  /**
   * Resets the model. Returns to the default settings.
   */
  public reset(): void {

    // Remove any previously saved particle states.
    this.savedParticleStates.forEach( map => map.clear() );

    // Clear out the test chamber and the model of any isotope instances.
    this.testChamber.removeAllIsotopes();
    this.isotopesList.reset();

    // Reset the configuration to the default state.
    this.interactivityModeProperty.reset();
    this.showingNaturesMixProperty.reset();

    // Reset the selected element last and, if this doesn't initiate a change, manually update the test chamber and
    // controllers to match the default state.
    const preResetProtonCount = this.selectedElementProtonCountProperty.value;
    this.selectedElementProtonCountProperty.reset();
    if ( this.selectedElementProtonCountProperty.value === preResetProtonCount ) {
      this.setControllers( this.interactivityModeProperty.value );
      if ( this.interactivityModeProperty.value === 'bucketsAndLargeAtoms' ) {
        this.fillBuckets();
      }
    }
  }
}

isotopesAndAtomicMass.register( 'MixturesModel', MixturesModel );
export default MixturesModel;