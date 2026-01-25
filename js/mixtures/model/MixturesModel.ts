// Copyright 2014-2026, University of Colorado Boulder

/**
 * Model portion of "Mixtures" module. This model contains a mixture of isotopes and allows a user to move various
 * different isotopes in and out of the "Isotope Test Chamber", and simply keeps track of the average mass within the chamber.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 * @author Aadish Gupta
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Color from '../../../../scenery/js/util/Color.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import NumberAtom from '../../../../shred/js/model/NumberAtom.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import ImmutableAtomConfig from './ImmutableAtomConfig.js';
import IsotopeTestChamber, { IsotopeTestChamberState } from './IsotopeTestChamber.js';
import MonoIsotopeBucket from './MonoIsotopeBucket.js';
import MovableAtom from './MovableAtom.js';
import NumericalIsotopeQuantityControl from './NumericalIsotopeQuantityControl.js';

// constants
const DEFAULT_ATOM_CONFIG = new ImmutableAtomConfig( 1, 0, 1 ); // Hydrogen.
const BUCKET_SIZE = new Dimension2( 120, 50 ); // Size of the buckets that will hold the isotopes.

// Within this model, the isotopes come in two sizes, small and large, and atoms are either one size or another,
// and all atoms that are shown at a given time are all the same size. The larger size is based somewhat on reality.
// The smaller size is used when we want to show a lot of atoms at once.
const LARGE_ISOTOPE_RADIUS = 10;
const SMALL_ISOTOPE_RADIUS = 4;
const NUM_LARGE_ISOTOPES_PER_BUCKET = 10; // Numbers of isotopes that are placed into the buckets

// List of colors which will be used to represent the various isotopes.
const ISOTOPE_COLORS = [ new Color( 180, 82, 205 ), Color.green, new Color( 255, 69, 0 ), new Color( 72, 137, 161 ) ];

/*
 * Enum of the possible interactivity types. The user is dragging large isotopes between the test chamber and a set of
 * buckets. The user is adding and removing small isotopes to/from the chamber using sliders.
 */
export const interactivityModeValues = [ 'bucketsAndLargeAtoms', 'slidersAndSmallAtoms' ] as const;
export type InteractivityModeType = typeof interactivityModeValues[number];

// constants
const NUM_NATURES_MIX_ATOMS = 1000; // Total number of atoms placed in the chamber when depicting nature's mix.

class MixturesModel {

  public readonly interactivityModeProperty: Property<InteractivityModeType>;
  public readonly possibleIsotopesProperty: Property<NumberAtom[]>;
  public readonly showingNaturesMixProperty: Property<boolean>;
  public readonly naturesIsotopeUpdated: Emitter;
  public readonly selectedAtomConfig: NumberAtom;
  public readonly testChamber: IsotopeTestChamber;
  public prototypeIsotope: NumberAtom;
  public readonly bucketList: ObservableArray<MonoIsotopeBucket>;
  public readonly isotopesList: ObservableArray<MovableAtom>;
  public readonly naturesIsotopesList: ObservableArray<MovableAtom>;
  public readonly numericalControllerList: ObservableArray<NumericalIsotopeQuantityControl>;

  // This map will be used to store the user-created mix states for each element and for the two interactivity modes so
  // that they can be restored when the user switches between elements, modes, and showing nature's mix.
  private mapIsotopeConfigToUserMixState: Map<number, Map<InteractivityModeType, State>>;

  /**
   * Constructor for the Mixtures Model
   **/
  public constructor() {

    // Property that determines the type of user interactivity that is set.
    this.interactivityModeProperty = new Property<InteractivityModeType>( 'bucketsAndLargeAtoms' );

    // This property contains the list of isotopes that exist in nature as variations of the current "prototype isotope".
    // In other words, this contains a list of all stable isotopes that match the atomic weight of the currently
    // configured isotope. There should be only one of each possible isotope.
    this.possibleIsotopesProperty = new Property<NumberAtom[]>( [] );

    // Property that determines whether the user's mix or nature's mix is being displayed.
    this.showingNaturesMixProperty = new Property<boolean>( false );

    // events emitted by instances of this type
    this.naturesIsotopeUpdated = new Emitter();

    this.selectedAtomConfig = new NumberAtom( {
      protonCount: DEFAULT_ATOM_CONFIG.protonCount,
      neutronCount: DEFAULT_ATOM_CONFIG.neutronCount,
      electronCount: DEFAULT_ATOM_CONFIG.electronCount
    } );

    // the test chamber into and out of which the isotopes can be moved
    this.testChamber = new IsotopeTestChamber();

    this.prototypeIsotope = new NumberAtom();

    // list of the isotope buckets
    this.bucketList = createObservableArray<MonoIsotopeBucket>();

    // This is a list of the "My Mix" isotopes that are
    // present in the model, either in the test chamber or the bucket.  This does NOT track the "Nature's Mix" isotopes.
    this.isotopesList = createObservableArray<MovableAtom>();

    this.naturesIsotopesList = createObservableArray<MovableAtom>();

    // List of the numerical controls that,
    // when present, can be used to add or remove isotopes to/from the test chamber.
    this.numericalControllerList = createObservableArray<NumericalIsotopeQuantityControl>();

    // map of elements to user mixes. These are restored when switching between elements
    this.mapIsotopeConfigToUserMixState = new Map<number, Map<InteractivityModeType, State>>();
    this.updatePossibleIsotopesList();

    // watch for external updates to the configuration and match them (the periodic table can cause this)
    this.selectedAtomConfig.atomUpdated.addListener( () => {
      this.setAtomConfiguration( this.selectedAtomConfig );
    } );

    // Set the initial atom configuration.
    this.setAtomConfiguration( this.selectedAtomConfig );

    // Listen to Property that indicates whether "Nature's Mix" is being shown and show/hide the appropriate isotopes
    // when the value changes. This doesn't need and unlink as it stays throughout the life of the sim.
    this.showingNaturesMixProperty.lazyLink( showingNaturesMix => {
      if ( showingNaturesMix ) {

        // Get the current user-created mix state.
        const usersMixState = this.getState();

        // We need to tweak this part of the state because we are transitioning to nature's mix.
        usersMixState.showingNaturesMix = false;

        // Save the user-created mix state so that it can be restored later if needed.
        let stateMapForProtonCount = this.mapIsotopeConfigToUserMixState.get(
          this.prototypeIsotope.protonCountProperty.get()
        );
        if ( !stateMapForProtonCount ) {

          // Nothing has been saved for this element yet, so create a new map to hold the states for the interactivity
          // modes.
          stateMapForProtonCount = new Map<InteractivityModeType, State>();
          this.mapIsotopeConfigToUserMixState.set(
            this.prototypeIsotope.protonCountProperty.get(),
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
        if ( this.mapIsotopeConfigToUserMixState.has( this.prototypeIsotope.protonCountProperty.get() ) ) {

          const stateMapForProtonCount = this.mapIsotopeConfigToUserMixState.get(
            this.prototypeIsotope.protonCountProperty.get()
          )!;

          if ( stateMapForProtonCount ) {
            const state = stateMapForProtonCount.get( this.interactivityModeProperty.get() );
            state && this.setState( state );
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
      const usersMixState = this.getState();
      usersMixState.interactivityMode = oldInteractivityMode;

      // Save the user-created mix state so that it can be restored later.
      let stateMapForProtonCount = this.mapIsotopeConfigToUserMixState.get(
        this.prototypeIsotope.protonCountProperty.get()
      );
      if ( !stateMapForProtonCount ) {

        // Nothing has been saved for this element yet, so create a new map to hold the states for the interactivity
        // modes.
        stateMapForProtonCount = new Map<InteractivityModeType, State>();
        this.mapIsotopeConfigToUserMixState.set(
          this.prototypeIsotope.protonCountProperty.get(),
          stateMapForProtonCount
        );
      }
      stateMapForProtonCount.set( oldInteractivityMode, usersMixState );

      // See if there is a previously saved user-created mix state for this element and interactivity mode and restore
      // it if found.
      if ( this.mapIsotopeConfigToUserMixState.has( this.prototypeIsotope.protonCountProperty.get() ) ) {
        stateMapForProtonCount = this.mapIsotopeConfigToUserMixState.get(
          this.prototypeIsotope.protonCountProperty.get()
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
   * Place an isotope into the test chamber or a bucket based on its current position.
   */
  private placeIsotope( isotope: MovableAtom, bucket: MonoIsotopeBucket, testChamber: IsotopeTestChamber ): void {
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
  private createAndAddIsotope( isotopeConfig: NumberAtom, animate: boolean ): MovableAtom | undefined {
    let newIsotope: MovableAtom | undefined;
    if ( this.interactivityModeProperty.get() === 'bucketsAndLargeAtoms' ) {

      // Create the specified isotope and add it to the appropriate bucket.
      newIsotope = new MovableAtom(
        isotopeConfig.protonCountProperty.get(),
        isotopeConfig.neutronCountProperty.get(),
        new Vector2( 0, 0 )
      );
      newIsotope.color = this.getColorForIsotope( isotopeConfig.protonCount, isotopeConfig.neutronCount );

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
  public getBucketForIsotope( isotope: NumberAtom ): MonoIsotopeBucket | null {
    let isotopeBucket: MonoIsotopeBucket | null = null;
    this.bucketList.forEach( bucket => {
      if ( bucket.isIsotopeAllowed( isotope.protonCountProperty.get(), isotope.neutronCountProperty.get() ) ) {
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
   * Returns the state of the model.
   */
  private getState(): State {

    // If any movable isotope instances are being dragged by the user at this moment, we need to force that isotope
    // instance into a state that indicates that it isn't.  Otherwise it can get lost, since it will neither be in a
    // bucket or in the test chamber.  This case can only occur in multi-touch situations, see
    // https://github.com/phetsims/isotopes-and-atomic-mass/issues/101.
    const userControlledMovableIsotopes = this.isotopesList.filter( isotope => isotope.isDraggingProperty.value );
    userControlledMovableIsotopes.forEach( isotope => {
      isotope.isDraggingProperty.set( false );
    } );

    return new State( this );
  }

  /**
   * Set the state of the model based on a previously created state representation.  This is used when switching between
   * elements and interactivity modes, since each element and mode can have its own user-created state.
   */
  private setState( modelState: State ): void {

    // Clear out any particles that are currently in the test chamber.
    this.removeAllIsotopesFromTestChamberAndModel();

    // Restore the prototype isotope.
    this.prototypeIsotope = modelState.elementConfig;
    this.updatePossibleIsotopesList();

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
   * Set the element that is currently in use, and for which all stable isotopes will be available for movement in and
   * out of the test chamber. In case you're wondering why this is done as an atom instead of just setting the atomic
   * number, it is so that this will play well with the existing controllers that already existed at the time this
   * class was created.
   *
   * For the sake of efficiency, clients should be careful not to call this when it isn't needed.
   */
  public setAtomConfiguration( atom: NumberAtom | ImmutableAtomConfig ): void {
    if ( !this.selectedAtomConfig.equals( atom ) ) {
      this.selectedAtomConfig.protonCountProperty.set( atom.protonCount );
      this.selectedAtomConfig.electronCountProperty.set( atom.electronCount );
      this.selectedAtomConfig.neutronCountProperty.set( atom.neutronCount );
    }

    if ( this.showingNaturesMixProperty.value ) {
      this.removeAllIsotopesFromTestChamberAndModel();
      this.prototypeIsotope.protonCountProperty.set( atom.protonCount );
      this.prototypeIsotope.neutronCountProperty.set( atom.neutronCount );
      this.prototypeIsotope.electronCountProperty.set( atom.electronCount );
      this.updatePossibleIsotopesList();
      this.showNaturesMix();
    }
    else {

      // Save the user's mix state for the current element before transitioning to the new one.
      if ( this.prototypeIsotope !== atom ) {

        const stateMapForProtonCount = this.mapIsotopeConfigToUserMixState.get(
          this.prototypeIsotope.protonCountProperty.get()
        );
        if ( stateMapForProtonCount ) {
          stateMapForProtonCount.set( this.interactivityModeProperty.get(), this.getState() );
        }
        else {

          // Nothing has been saved for this element yet, so create a new map to hold the states for the interactivity
          // modes.
          const newStateMapForProtonCount = new Map<InteractivityModeType, State>();
          newStateMapForProtonCount.set( this.interactivityModeProperty.get(), this.getState() );
          this.mapIsotopeConfigToUserMixState.set(
            this.prototypeIsotope.protonCountProperty.get(),
            newStateMapForProtonCount
          );
        }
      }

      // Check whether previous state information was stored for this configuration.
      if ( this.mapIsotopeConfigToUserMixState.has( atom.protonCount ) &&
           this.mapIsotopeConfigToUserMixState.get( atom.protonCount )!.get( this.interactivityModeProperty.get() ) ) {

        this.setState( this.mapIsotopeConfigToUserMixState.get( atom.protonCount )!.get( this.interactivityModeProperty.get() )! );
      }
      else {

        // Set initial default state for this isotope configuration.
        this.removeAllIsotopesFromTestChamberAndModel();

        this.prototypeIsotope.protonCountProperty.set( atom.protonCount );
        this.prototypeIsotope.neutronCountProperty.set( atom.neutronCount );
        this.prototypeIsotope.electronCountProperty.set( atom.electronCount );
        this.updatePossibleIsotopesList();

        // Set all model elements for the first time this element's user mix is shown.
        this.setUpInitialUsersMix();
      }
    }
  }

  /**
   * Get a list of the possible isotopes, sorted from lightest to heaviest.
   */
  private updatePossibleIsotopesList(): void {
    const stableIsotopes = AtomIdentifier.getStableIsotopesOfElement( this.prototypeIsotope.protonCountProperty.get() );
    const newIsotopesList: NumberAtom[] = [];
    Object.entries( stableIsotopes ).forEach( ( [ index, isotope ] ) => {
      newIsotopesList.push( new NumberAtom( {
        protonCount: isotope[ 0 ],
        neutronCount: isotope[ 1 ],
        electronCount: isotope[ 2 ]
      } ) );
    } );

    // Sort from lightest to heaviest. Do not change this without careful considerations, since several areas of the
    // code count on this. This is kept in case someone adds another isotope to AtomIdentifier and doesn't add it
    // in order.
    newIsotopesList.sort( ( atom1, atom2 ) => atom1.getIsotopeAtomicMass() - atom2.getIsotopeAtomicMass() );

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
        [
          AtomIdentifier.getName( isotopeConfig.protonCountProperty.get() ),
          isotopeConfig.massNumberProperty
        ], ( name: string, massNumber: number ) => `${name}-${massNumber}`
      );

      if ( buckets ) {
        const newBucket = new MonoIsotopeBucket(
          isotopeConfig.protonCountProperty.get(),
          isotopeConfig.neutronCountProperty.get(),
          {
            position: new Vector2( controllerXOffset + interControllerDistanceX * i, controllerYOffsetBucket ),
            size: BUCKET_SIZE,
            baseColor: this.getColorForIsotope( isotopeConfig.protonCount, isotopeConfig.neutronCount ),
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
        const controllerIsotope = new MovableAtom(
          isotopeConfig.protonCountProperty.get(),
          isotopeConfig.neutronCountProperty.get(),
          new Vector2( 0, 0 ),
          { particleRadius: SMALL_ISOTOPE_RADIUS }
        );
        controllerIsotope.color = this.getColorForIsotope( isotopeConfig.protonCount, isotopeConfig.neutronCount );

        newController.controllerIsotope = controllerIsotope;

        this.numericalControllerList.add( newController );
      }
    }
  }

  public removeNumericalControllers(): void {
    this.numericalControllerList.clear();
  }

  /**
   * Get the color for an isotope.
   */
  public getColorForIsotope( protonCount: number, neutronCount: number ): Color {
    const isotope = this.possibleIsotopesProperty.value.find(
      atom => atom.protonCountProperty.get() === protonCount &&
              atom.neutronCountProperty.get() === neutronCount
    );
    return isotope && this.possibleIsotopesProperty.value.includes( isotope ) ?
           ISOTOPE_COLORS[ this.possibleIsotopesProperty.value.indexOf( isotope ) ] :
           Color.PINK;
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
    possibleIsotopesCopy.sort( ( atom1, atom2 ) => AtomIdentifier.getNaturalAbundance( atom2, numDigitsForComparison ) -
                                                   AtomIdentifier.getNaturalAbundance( atom1, numDigitsForComparison ) );

    // Add the isotopes.
    possibleIsotopesCopy.forEach( isotopeConfig => {
      let numToCreate = roundSymmetric( NUM_NATURES_MIX_ATOMS * AtomIdentifier.getNaturalAbundance( isotopeConfig, 5 ) );
      if ( numToCreate === 0 ) {

        // The calculated quantity was 0, but we don't want to have no instances of this isotope in the chamber, so
        // add only one. This behavior was requested by the design team.
        numToCreate = 1;
      }
      const isotopesToAdd: MovableAtom[] = [];
      for ( let i = 0; i < numToCreate; i++ ) {
        const newIsotope = new MovableAtom(
          isotopeConfig.protonCountProperty.get(),
          isotopeConfig.neutronCountProperty.get(),
          this.testChamber.generateRandomPosition(),
          { particleRadius: SMALL_ISOTOPE_RADIUS }
        );
        newIsotope.color = this.getColorForIsotope( isotopeConfig.protonCount, isotopeConfig.neutronCount );

        newIsotope.showLabel = false;
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
   * Resets the model. Returns the default settings.
   */
  public reset(): void {
    this.clearBox();
    this.naturesIsotopesList.clear();
    this.interactivityModeProperty.reset();
    this.possibleIsotopesProperty.reset();
    this.showingNaturesMixProperty.reset();
    this.prototypeIsotope = new NumberAtom();

    // Make sure there is nothing stored for the default configuration so that it doesn't get restored when we set that
    // as the initial configuration.
    this.mapIsotopeConfigToUserMixState.delete( DEFAULT_ATOM_CONFIG.protonCount );

    // Set the default element
    this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );

    // Remove all stored user-created mix states.  This must be done after setting the default isotope because state
    // could have been saved when the default was set.
    this.mapIsotopeConfigToUserMixState.clear();
  }
}

/**
 * Class that can be used to save the state of the model. This will be used for saving and restoring of the state when
 * switching between various modes.
 */
class State {
  public readonly elementConfig: NumberAtom;
  public readonly isotopeTestChamberState: IsotopeTestChamberState;
  public interactivityMode: InteractivityModeType;
  public showingNaturesMix: boolean;
  public readonly bucketList: MonoIsotopeBucket[];
  public readonly bucketToParticleListMap: Map<MonoIsotopeBucket, MovableAtom[]>;

  /**
   * @param model - The model to create state from
   */
  public constructor( model: MixturesModel ) {
    this.elementConfig = new NumberAtom( {
      protonCount: model.prototypeIsotope.protonCountProperty.get(),
      neutronCount: model.prototypeIsotope.neutronCountProperty.get(),
      electronCount: model.prototypeIsotope.electronCountProperty.get()
    } );
    this.isotopeTestChamberState = model.testChamber.getState();
    this.interactivityMode = model.interactivityModeProperty.get();
    this.showingNaturesMix = model.showingNaturesMixProperty.get();

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