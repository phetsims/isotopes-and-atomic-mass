//  Copyright 2002-2015, University of Colorado Boulder

/**
 * Model portion of "Mix Isotopes" module.  This model contains a mixture
 * of isotopes and allows a user to move various different isotopes in and
 * out of the "Isotope Test Chamber", and simply keeps track of the average
 * mass within the chamber.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Color = require( 'SCENERY/util/Color' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var SharedConstants = require( 'SHRED/SharedConstants' );
  var PropertySet = require( 'AXON/PropertySet' );
  var MovableAtom = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MovableAtom' );

  //TODO Remove after debugging
  var NumericalIsotopeQuantityControl = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/NumericalIsotopeQuantityControl' );
  var MonoIsotopeBucket = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MonoIsotopeBucket' );
  var IsotopeTestChamber = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/IsotopeTestChamber' );


  // -----------------------------------------------------------------------
  // Class Data
  // -----------------------------------------------------------------------

  // Default initial atom configuration.
  var DEFAULT_ATOMIC_NUMBER = 1;

  // Immutable atom
  // var DEFAULT_PROTOTYPE_ISOTOPE_CONFIG = AtomIdentifier.getMostCommonIsotope( DEFAULT_ATOMIC_NUMBER );

  // Size of the buckets that will hold the isotopes.
  var BUCKET_SIZE = new Dimension2( 1000, 400 ); // In picometers.

  // Speed with which atoms move when animated.  Empirically determined,
  // adjust as needed for the desired look.
  var ATOM_MOTION_SPEED = 2500; // In picometers per sec of sim time.

  // Within this model, the isotopes come in two sizes, small and large, and
  // atoms are either one size or another, and all atoms that are shown at
  // a given time are all the same size.  The larger size is based somewhat
  // on reality.  The smaller size is used when we want to show a lot of
  // atoms at once.
  var LARGE_ISOTOPE_RADIUS = 83; // in picometers.
  var SMALL_ISOTOPE_RADIUS = 30; // in picometers.

  // Numbers of isotopes that are placed into the buckets when a new atomic
  // number is selected.
  var NUM_LARGE_ISOTOPES_PER_BUCKET = 10;

  // List of colors which will be used to represent the various isotopes.
  var ISOTOPE_COLORS = {
    purple: new Color( 180, 82, 205 ),
    green: Color.green,
    red: new Color( 255, 69, 0 ),
    brown: new Color( 139, 90, 43 )

  };


  /*
   * Enum of the possible interactivity types.
   * The user is dragging large isotopes between the test chamber and a set of buckets.
   * The user is adding and removing small isotopes to/from the chamber using sliders.
   */
  var InteractivityMode = {
    BUCKETS_AND_LARGE_ATOMS: 'BUCKETS_AND_LARGE_ATOMS',
    SLIDERS_AND_SMALL_ATOMS: 'SLIDERS_AND_SMALL_ATOMS'
  };


  // Total number of atoms placed in the chamber when depicting nature's mix.
  var NUM_NATURES_MIX_ATOMS = 1000;


  // Strings
  var neutronsNameString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/neutrons.name' );


  /**
   * Class that defines the state of the model.  This can be used for saving
   * and restoring of the state.
   *
   * @author John Blanco
   */
  function State( model ) {

    this.elementConfig = model.prototypeIsotope;
    this.isotopeTestChamberState = model.testChamber.getState();
    this.interactivityMode = model.interactivityMode;
    this.showingNaturesMix = model.showingNaturesMixProperty;

    // TODO These are here just to help with the port and should be removed after the port is completed.
    //
    //
    //public IAtom getElementConfiguration() {
    //  return elementConfig;
    //}
    //
    //public IsotopeTestChamber.State getIsotopeTestChamberState() {
    //  return isotopeTestChamberState;
    //}
    //
    //public InteractivityMode getInteractivityMode() {
    //  return interactivityMode;
    //}
    //
    //public boolean isShowingNaturesMix() {
    //  return showingNaturesMix;
    //}
    //
    //public void setShowingNaturesMix( boolean showingNaturesMix ) {
    //  this.showingNaturesMix = showingNaturesMix;
  }

  /**
   * Constructor for the Mix Isotopes Model
   **/
  function MixIsotopesModel() {
    // Property that determines the type of user interactivity that is set.
    // See the enum definition for more information about the modes.

    PropertySet.call( this, {
      interactivityMode: InteractivityMode.BUCKETS_AND_LARGE_ATOMS,
      potentialIsotopesProperty: []     // This property contains the list of isotopes that exist in nature as
                                        // variations of the current "prototype isotope".  In other words, this
                                        // contains a list of all stable isotopes that match the atomic weight
                                        // of the currently configured isotope.  There should be only one of each
                                        // possible isotope.
    } );

//     Instance Data
//    -----------------------------------------------------------------------


    // The test chamber into and out of which the isotopes can be moved.
    //var testChamber = new IsotopeTestChamber( this );

    // This atom is the "prototype isotope", meaning that it is set in order
    // to set the atomic weight of the family of isotopes that are currently
    // in use.
    this.prototypeIsotope = new NumberAtom( 0, 0, 0 );


    var possibleIsotopesProperty = AtomIdentifier.isotopeList;
//          console.log(AtomIdentifier.getStableIsotopesOfElement(1));

    // List of the isotope buckets.
    // TODO make observable array
    this.bucketList = new ObservableArray();

    // List of the numerical controls that, when present, can be used to add
    // or remove isotopes to/from the test chamber.
    // TODO Debug NumericalIsotopeQuantityControl

    var testChamber = new IsotopeTestChamber( this );
    var testMovable = new MovableAtom( 5, 5, new Vector2( 0, 0 ) );
    var testMovable1 = new MovableAtom( 12, 5, new Vector2( 0, 0 ) );
    testChamber.addIsotopeToChamber( testMovable, true );
    testChamber.addIsotopeToChamber( testMovable1, true );
    var prop = testChamber.getIsotopeProportion( testMovable1.atomConfiguration );
    debugger;

//          // This is an observer that watches our own interactivity mode setting.
//          // It is declared as a member variable so that it can be "unhooked" in
//          // circumstances where it is necessary.
//          private final SimpleObserver interactivityModeObserver = new SimpleObserver() {
//              public void update() {
//                  assert showingNaturesMixProperty.get() == false; // Interactivity mode shouldn't change when showing nature's mix.
//                  if ( mapIsotopeConfigToUserMixState.containsKey( prototypeIsotope.getNumProtons() ) ) {
//                      // Erase any previous state for this isotope.
//                      mapIsotopeConfigToUserMixState.remove( prototypeIsotope.getNumProtons() );
//                  }
//                  removeAllIsotopesFromTestChamberAndModel();
//                  addIsotopeControllers();
//              }
//          };


  }

  return inherit( PropertySet, MixIsotopesModel, {
    // -----------------------------------------------------------------------
    // Methods
    // -----------------------------------------------------------------------

    /**
     * Create and add an isotope of the specified configuration.  Where the
     * isotope is initially placed depends upon the current interactivity mode.
     * @param {NumberAtom} isotopeConfig
     * @param {boolean} moveImmediately
     *
     * TODO Prototype isotope should be made an instance variable in constructor.
     * TODO Port setMotionVelocity
     */
    createAndAddIsotope: function( isotopeConfig, moveImmediately ) {
      assert && assert( isotopeConfig.protonCount === this.prototypeIsotope.protonCount, "179" );
      assert && assert( isotopeConfig.electronCount === isotopeConfig.electronCount );
      var newIsotope;

      if ( this.interactivityModeProperty === this.InteractivityModeProperty ) {
        // Create the specified isotope and add it to the appropriate bucket.
        newIsotope = new MovableAtom( isotopeConfig.getNumProtons(), isotopeConfig.getNumNeutrons(),
          LARGE_ISOTOPE_RADIUS, new Vector2( 0, 0 ) );

        // TODO Make sure this velocity looks good
        newIsotope.velocity = ATOM_MOTION_SPEED;

        // newIsotope.setMotionVelocity( ATOM_MOTION_SPEED );
        // newIsotope.addListener( isotopeGrabbedListener );

        this.getBucketForIsotope( isotopeConfig ).addIsotopeInstanceFirstOpen( newIsotope, moveImmediately );
      }

      else {
        // Create the specified isotope and add it directly to the test chamber.
        var randomIsotopeLocation = testChamber.generateRandomLocation();
        newIsotope = new MovableAtom( isotopeConfig.protonCount, isotopeConfig.neutronCount,
          SMALL_ISOTOPE_RADIUS, new Vector2( 0, 0 ) );

        testChamber.addIsotopeToChamber( newIsotope );
      }


      // TODO (Remove or not) notifyIsotopeInstanceAdded( newIsotope );
      return newIsotope;

    },

    /**
     * Get the bucket where the given isotope can be placed.
     * @param {NumberAtom} isotope
     * @return {MonoIsotopeBucket} A bucket that can hold the isotope if one exists, null if not.
     */
    getBucketForIsotope: function( isotope ) {
      var isotopeBucket = null;
      this.bucketList.forEach( function( bucket ) {
        if ( bucket.isIsotopeAllowed( isotope.protonCount, isotope.neutronCount ) ) {
          // Found it.
          isotopeBucket = bucket;
          return;
        }
      } )
      return isotopeBucket;
    },

    /**
     * Add newBucket to bucketList.
     *
     * @param {MonoIsotopeParticleBucket} newBucket
     */

    addBucket: function( newBucket ) {
      this.bucketList.push( newBucket );
      // notifyBucketAdded( newBucket );
    },

    /**
     * Set up the initial user's mix for the currently configured element.
     * This should set all state variables to be consistent with the display
     * of the initial users mix.  This is generally called the first time an
     * element is selected after initialization or reset.
     */
    setUpInitialUsersMix: function() {
      this.removeAllIsotopesFromTestChamberAndModel();
      this.showingNaturesMixProperty.set( false );
      this.interactivityModeProperty.set( InteractivityMode.BUCKETS_AND_LARGE_ATOMS );
      this.mapIsotopeConfigToUserMixState.remove( prototypeIsotope.getNumProtons() );
      // TODO (remove or not) addIsotopeControllers();
    },

    /**
     * Returns the prototypeIsotope
     * @returns {NumberAtom} prototypeIsotope
     */
    getAtom: function() {
      return prototypeIsotope;
    },

    /**
     * Returns the state of the model.
     * @returns {State}
     */
    getState: function() {
      return new State( this );
    },

    /**
     * Set the state of the model based on a previously created state
     * representation.
     * @param {State} modelState
     */
    setState: function( modelState ) {
      // Clear out any particles that are currently in the test chamber.
      this.removeAllIsotopesFromTestChamberAndModel();

      // Restore the prototype isotope.
      this.prototypeIsotope.setConfiguration( modelState.getElementConfiguration() );
      this.updatePossibleIsotopesList();

      // Restore the interactivity mode.  We have to unhook our usual
      // listener in order to avoid undesirable effects.
      this.interactivityModeProperty.set( modelState.getInteractivityMode() );


      // Restore the mix mode.  The assertion here checks that the mix mode
      // (i.e. nature's or user's mix) matches the value that is being
      // restored.  This requirement is true as of 3/16/2011.  It is
      // possible that it could change, but for now, it is good to test.
      assert && assert( modelState.isShowingNaturesMix() === this.showingNaturesMixProperty.get() );
      this.showingNaturesMixProperty.set( modelState.isShowingNaturesMix() );

      // Add any particles that were in the test chamber.
      this.testChamber.setState( modelState.getIsotopeTestChamberState() );
      this.testChamber.containedIsotopes.forEach( function( isotope ) {
        // isotope.addListener( isotopeGrabbedListener );
        isotope.addedToModel();
        // notifyIsotopeInstanceAdded( isotope );
      } );

      // Add the appropriate isotope controllers.  This will create the
      // controllers in their initial states.
      // addIsotopeControllers();

      // Set up the isotope controllers to match whatever is in the test
      // chamber.
      if ( this.interactivityModeProperty.get() === InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
        // Remove isotopes from buckets based on the number in the test
        // chamber.  This makes sense because in this mode, any isotopes
        // in the chamber must have come from the buckets.
        // @param {NumberAtom} isotopeConfig
        for ( var isotopeConfig in possibleIsotopesProperty.get() ) {
          var isotopeCount = this.testChamber.getIsotopeCount( isotopeConfig );
          var bucket = getBucketForIsotope( isotopeConfig );
          for ( var i = 0; i < isotopeCount; i++ ) {
            var removedIsotope = bucket.removeArbitraryIsotope();
            // removedIsotope.removeListener( isotopeGrabbedListener );
            removedIsotope.removedFromModel();
          }
        }
      }
      else {
        // Assume numerical controllers.
        assert && assert( interactivityModeProperty.get() == InteractivityMode.SLIDERS_AND_SMALL_ATOMS );
        // Set each controller to match the number in the chamber.
        //@param {NumberAtom} isotopeConfig
        for ( var isotopeConfig in possibleIsotopesProperty.get() ) {
          var controller = this.getNumericalControllerForIsotope( isotopeConfig );
          controller.setIsotopeQuantity( this.testChamber.getIsotopeCount( isotopeConfig ) );
        }
      }
    }


  } );

} )
;


//        /**
//         * Set the element that is currently in use, and for which all stable
//         * isotopes will be available for movement in and out of the test chamber.
//         * In case you're wondering why this is done as an atom instead of just
//         * setting the atomic number, it is so that this will play well with the
//         * existing controllers (such as the PeriodicTableControlNode) that
//         * already existed at the time this class was created.
//         */
//        public void setAtomConfiguration( IAtom atom ) {
//            // This method does NOT check if the specified atom is already the
//            // current configuration.  This allows it to be as a sort of reset
//            // routine.  For the sake of efficiency, callers should be careful not
//            // to call this when it isn't needed.
//
//            if ( showingNaturesMixProperty.get() ) {
//                removeAllIsotopesFromTestChamberAndModel();
//                prototypeIsotope.setConfiguration( atom );
//                updatePossibleIsotopesList();
//                showNaturesMix();
//            }
//            else {
//                // Save the user's mix state for the current element
//                // before transitioning to the new one.
//                if ( !atom.equals( prototypeIsotope.toImmutableAtom() ) ) {
//                    mapIsotopeConfigToUserMixState.put( prototypeIsotope.getNumProtons(), getState() );
//                }
//
//                if ( mapIsotopeConfigToUserMixState.containsKey( atom.getNumProtons() ) ) {
//                    // Restore the previously saved state for this element.
//                    setState( mapIsotopeConfigToUserMixState.get( atom.getNumProtons() ) );
//                }
//                else {
//                    // Clean up any previous isotopes.
//                    removeAllIsotopesFromTestChamberAndModel();
//
//                    // Update the prototype atom (a.k.a. isotope) configuration.
//                    prototypeIsotope.setConfiguration( atom );
//                    updatePossibleIsotopesList();
//
//                    // Set all model elements for the first time this element's
//                    // user mix is shown.
//                    setUpInitialUsersMix();
//                }
//            }
//        }
//
//        /**
//         * Get a list of the possible isotopes, sorted from lightest to heaviest.
//         */
//        public void updatePossibleIsotopesList() {
//            // Get a list of all stable isotopes for the current atomic number.
//            ArrayList<ImmutableAtom> newIsotopeList = AtomIdentifier.getStableIsotopesOfElement( prototypeIsotope.getNumProtons() );
//
//            // Sort from lightest to heaviest.  Do not change this without careful
//            // considerations, since several areas of the code count on this.
//            Collections.sort( newIsotopeList, new Comparator<IAtom>() {
//                public int compare( IAtom atom2, IAtom atom1 ) {
//                    return new Double( atom2.getAtomicMass() ).compareTo( atom1.getAtomicMass() );
//                }
//            } );
//
//            // Update the list of possible isotopes for this atomic configuration.
//            possibleIsotopesProperty.set( newIsotopeList );
//        }
//
//        /**
//         * Remove all buckets that are currently in the model, as well as the particles they contained.
//         */
//        private void removeBuckets() {
//            for ( MonoIsotopeParticleBucket bucket : bucketList ) {
//                for ( MovableAtom movableAtom : bucket.getContainedIsotopes() ) {
//                    bucket.removeParticle( movableAtom );
//                    movableAtom.removedFromModel();
//                    movableAtom.removeListener( isotopeGrabbedListener );
//                }
//            }
//            ArrayList<MonoIsotopeParticleBucket> oldBuckets = new ArrayList<MonoIsotopeParticleBucket>( bucketList );
//            bucketList.clear();
//            for ( MonoIsotopeParticleBucket bucket : oldBuckets ) {
//                notifyBucketRemoved( bucket );
//            }
//        }
//
//        /**
//         * Set up the appropriate isotope controllers based on the currently
//         * selected element, the interactivity mode, and the mix setting (i.e.
//         * user's mix or nature's mix).  This will remove any existing
//         * controllers.  This will also add the appropriate initial number of
//         * isotopes to any buckets that are created.
//         */
//        private void addIsotopeControllers() {
//            // Remove existing controllers.
//            removeBuckets();
//            removeNumericalControllers();
//
//            final boolean buckets = interactivityModeProperty.get() == InteractivityMode.BUCKETS_AND_LARGE_ATOMS || showingNaturesMixProperty.get();
//            // Set up layout variables.
//            double controllerYOffset = testChamber.getTestChamberRect().getMinY() - 400;
//            double interControllerDistanceX;
//            double controllerXOffset;
//            if ( possibleIsotopesProperty.get().size() < 4 ) {
//                // We can fit 3 or less cleanly under the test chamber.
//                interControllerDistanceX = testChamber.getTestChamberRect().getWidth() / possibleIsotopesProperty.get().size();
//                controllerXOffset = testChamber.getTestChamberRect().getMinX() + interControllerDistanceX / 2;
//            }
//            else {
//                // Four controllers don't fit well under the chamber, so use a
//                // positioning algorithm where they are extended a bit to the
//                // right.
//                interControllerDistanceX = ( testChamber.getTestChamberRect().getWidth() * 1.2 ) / possibleIsotopesProperty.get().size();
//                controllerXOffset = testChamber.getTestChamberRect().getMinX() + interControllerDistanceX / 2;
//            }
//            // Add the controllers.
//            for ( int i = 0; i < possibleIsotopesProperty.get().size(); i++ ) {
//                ImmutableAtom isotopeConfig = possibleIsotopesProperty.get().get( i );
//                if ( buckets ) {
//                    String bucketCaption = AtomIdentifier.getName( isotopeConfig ) + "-" + isotopeConfig.getMassNumber();
//                    MonoIsotopeParticleBucket newBucket = new MonoIsotopeParticleBucket( new Point2D.Double(
//                            controllerXOffset + interControllerDistanceX * i, controllerYOffset ),
//                                                                                         BUCKET_SIZE, getColorForIsotope( isotopeConfig ), bucketCaption, LARGE_ISOTOPE_RADIUS,
//                                                                                         isotopeConfig.getNumProtons(), isotopeConfig.getNumNeutrons() );
//                    addBucket( newBucket );
//                    if ( !showingNaturesMixProperty.get() ) {
//                        // Create and add initial isotopes to the new bucket.
//                        for ( int j = 0; j < NUM_LARGE_ISOTOPES_PER_BUCKET; j++ ) {
//                            createAndAddIsotope( isotopeConfig, true );
//                        }
//                    }
//                }
//                else {
//                    // Assume a numerical controller.
//                    NumericalIsotopeQuantityControl newController = new NumericalIsotopeQuantityControl( this, isotopeConfig, new Point2D.Double( controllerXOffset + interControllerDistanceX * i, controllerYOffset ) );
//                    newController.setIsotopeQuantity( testChamber.getIsotopeCount( isotopeConfig ) );
//                    numericalControllerList.add( newController );
//                    notifyNumericalControllerAdded( newController );
//                }
//            }
//        }
//

//
//        private void removeNumericalControllers() {
//            ArrayList<NumericalIsotopeQuantityControl> oldControllers = new ArrayList<NumericalIsotopeQuantityControl>( numericalControllerList );
//            numericalControllerList.clear();
//            for ( NumericalIsotopeQuantityControl controller : oldControllers ) {
//                controller.removedFromModel();
//            }
//        }
//

//
//        private NumericalIsotopeQuantityControl getNumericalControllerForIsotope( ImmutableAtom isotope ) {
//            NumericalIsotopeQuantityControl isotopeController = null;
//            for ( NumericalIsotopeQuantityControl controller : numericalControllerList ) {
//                if ( controller.getIsotopeConfig().equals( isotope ) ) {
//                    // Found it.
//                    isotopeController = controller;
//                    break;
//                }
//            }
//            return isotopeController;
//        }
//
//        /**
//         * Get a reference to the test chamber model.
//         */
//        public IsotopeTestChamber getIsotopeTestChamber() {
//            return testChamber;
//        }
//
//        public Property<List<ImmutableAtom>> getPossibleIsotopesProperty() {
//            return possibleIsotopesProperty;
//        }
//
//        public Property<InteractivityMode> getInteractivityModeProperty() {
//            return interactivityModeProperty;
//        }
//
//        public BooleanProperty getShowingNaturesMixProperty() {
//            return showingNaturesMixProperty;
//        }
//
//        public Color getColorForIsotope( ImmutableAtom isotope ) {
//            int index = possibleIsotopesProperty.get().indexOf( isotope );
//            return index >= 0 ? ISOTOPE_COLORS[possibleIsotopesProperty.get().indexOf( isotope )] : Color.WHITE;
//        }
//
//        public void reset() {
//            // Reset all properties that need resetting.
//            showingNaturesMixProperty.reset();
//            interactivityModeProperty.reset();
//
//            // Remove any stored state for the default atom.
//            mapIsotopeConfigToUserMixState.remove( DEFAULT_PROTOTYPE_ISOTOPE_CONFIG.getNumProtons() );
//
//            // Set the default element.
//            setAtomConfiguration( DEFAULT_PROTOTYPE_ISOTOPE_CONFIG );
//
//            // Remove all stored user's mix states.  This must be done after
//            // setting the default isotope because state could have been saved
//            // when the default was set.
//            mapIsotopeConfigToUserMixState.clear();
//        }
//
//        public void addListener( Listener listener ) {
//            listeners.add( listener );
//        }
//
//        public void removeListener( Listener listener ) {
//            listeners.remove( listener );
//        }
//
//        protected void notifyIsotopeInstanceAdded( MovableAtom atom ) {
//            for ( Listener listener : listeners ) {
//                listener.isotopeInstanceAdded( atom );
//            }
//        }
//
//        private void notifyBucketAdded( MonoIsotopeParticleBucket bucket ) {
//            for ( Listener listener : listeners ) {
//                listener.isotopeBucketAdded( bucket );
//            }
//        }
//
//        private void notifyBucketRemoved( MonoIsotopeParticleBucket bucket ) {
//            for ( Listener listener : listeners ) {
//                listener.isotopeBucketRemoved( bucket );
//            }
//        }
//
//        private void notifyNumericalControllerAdded( NumericalIsotopeQuantityControl controller ) {
//            for ( Listener listener : listeners ) {
//                listener.isotopeNumericalControllerAdded( controller );
//            }
//        }
//
//        private void showNaturesMix() {
//            assert showingNaturesMixProperty.get() == true; // This method shouldn't be called if we're not showing nature's mix.
//
//            // Clear out anything that is in the test chamber.  If anything
//            // needed to be stored, it should have been done by now.
//            removeAllIsotopesFromTestChamberAndModel();
//
//            // Get the list of possible isotopes and then sort it by abundance
//            // so that the least abundant are added last, thus assuring that
//            // they will be visible.
//            ArrayList<ImmutableAtom> possibleIsotopesCopy = new ArrayList<ImmutableAtom>( getPossibleIsotopesProperty().get() );
//            Collections.sort( possibleIsotopesCopy, new Comparator<IAtom>() {
//                public int compare( IAtom atom2, IAtom atom1 ) {
//                    return new Double( AtomIdentifier.getNaturalAbundance( atom1 ) ).compareTo( AtomIdentifier.getNaturalAbundance( atom2 ) );
//                }
//            } );
//
//            // Add the isotopes.
//            for ( ImmutableAtom isotopeConfig : possibleIsotopesCopy ) {
//                int numToCreate = (int) Math.round( NUM_NATURES_MIX_ATOMS * AtomIdentifier.getNaturalAbundance( isotopeConfig ) );
//                if ( numToCreate == 0 ) {
//                    // The calculated quantity was 0, but we don't want to have
//                    // no instances of this isotope in the chamber, so add only
//                    // one.  This behavior was requested by the design team.
//                    numToCreate = 1;
//                }
//                List<MovableAtom> isotopesToAdd = new ArrayList<MovableAtom>();
//                for ( int i = 0; i < numToCreate; i++ ) {
//                    MovableAtom newIsotope = new MovableAtom(
//                            isotopeConfig.getNumProtons(),
//                            isotopeConfig.getNumNeutrons(),
//                            SMALL_ISOTOPE_RADIUS,
//                            testChamber.generateRandomLocation(),
//                            clock );
//                    isotopesToAdd.add( newIsotope );
//                    notifyIsotopeInstanceAdded( newIsotope );
//                }
//                testChamber.bulkAddIsotopesToChamber( isotopesToAdd );
//            }
//
//            // Add the isotope controllers (i.e. the buckets).
//            addIsotopeControllers();
//        }
//
//        /**
//         * Remove all isotopes from the test chamber, and then remove them from
//         * the model.  This method does not add removed isotopes back to the
//         * buckets or update the controllers.
//         */
//        private void removeAllIsotopesFromTestChamberAndModel() {
//            testChamber.removeAllIsotopes( true );
//        }
//
//        /**
//         * Remove the particles from the test chamber and set the state of the
//         * isotope controllers to be consistent.  This method retains the current
//         * interactivity mode, and thus the controllers.
//         */
//        public void clearTestChamber() {
//            for ( MovableAtom isotope : new ArrayList<MovableAtom>( testChamber.getContainedIsotopes() ) ) {
//                testChamber.removeIsotopeFromChamber( isotope );
//                if ( interactivityModeProperty.get() == InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
//                    // Add isotope to bucket.
//                    getBucketForIsotope( isotope.getAtomConfiguration() ).addIsotopeInstanceFirstOpen( isotope, true );
//                }
//                else {
//                    // Remove isotope completely from the model.
//                    isotope.removeListener( isotopeGrabbedListener );
//                    isotope.removedFromModel();
//                }
//            }
//            // Force any numerical controllers that exist to update.
//            for ( NumericalIsotopeQuantityControl controller : numericalControllerList ) {
//                controller.syncToTestChamber();
//            }
//        }
//
//  } );


//    /**
//     * Create and add an isotope of the specified configuration.  Where the
//     * isotope is initially placed depends upon the current interactivity mode.
//     */
//    protected MovableAtom createAndAddIsotope( ImmutableAtom isotopeConfig, boolean moveImmediately ) {
//        assert isotopeConfig.getNumProtons() == prototypeIsotope.getNumProtons(); // Verify that this is a valid isotope.
//        assert isotopeConfig.getNumProtons() == isotopeConfig.getNumElectrons();  // Should always be neutral.
//        MovableAtom newIsotope;
//        if ( interactivityModeProperty.get() == InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
//            // Create the specified isotope and add it to the appropriate bucket.
//            newIsotope = new MovableAtom( isotopeConfig.getNumProtons(), isotopeConfig.getNumNeutrons(),
//                                          LARGE_ISOTOPE_RADIUS, new Point2D.Double(), getClock() );
//            newIsotope.setMotionVelocity( ATOM_MOTION_SPEED );
//            newIsotope.addListener( isotopeGrabbedListener );
//            // Add this isotope to a bucket.
//            getBucketForIsotope( isotopeConfig ).addIsotopeInstanceFirstOpen( newIsotope, moveImmediately );
//        }
//        else {
//            // Create the specified isotope and add it directly to the test chamber.
//            Point2D randomIsotopeLocation = testChamber.generateRandomLocation();
//            newIsotope = new MovableAtom( isotopeConfig.getNumProtons(), isotopeConfig.getNumNeutrons(),
//                                          SMALL_ISOTOPE_RADIUS, randomIsotopeLocation, getClock() );
//            testChamber.addIsotopeToChamber( newIsotope );
//        }
//        notifyIsotopeInstanceAdded( newIsotope );
//        return newIsotope;
//    }
//
//    /**
//     * Set up the initial user's mix for the currently configured element.
//     * This should set all state variables to be consistent with the display
//     * of the initial users mix.  This is generally called the first time an
//     * element is selected after initialization or reset.
//     */
//    private void setUpInitialUsersMix() {
//        removeAllIsotopesFromTestChamberAndModel();
//        showingNaturesMixProperty.set( false );
//        interactivityModeProperty.set( InteractivityMode.BUCKETS_AND_LARGE_ATOMS );
//        mapIsotopeConfigToUserMixState.remove( prototypeIsotope.getNumProtons() );
//        addIsotopeControllers();
//    }
//
//    public BuildAnAtomClock getClock() {
//        return clock;
//    }
//
//    public IDynamicAtom getAtom() {
//        return prototypeIsotope;
//    }
//
//    private State getState() {
//        return new State( this );
//    }
//
//    /**
//     * Set the state of the model based on a previously created state
//     * representation.
//     */
//    private void setState( State modelState ) {
//        // Clear out any particles that are currently in the test chamber.
//        removeAllIsotopesFromTestChamberAndModel();
//
//        // Restore the prototype isotope.
//        prototypeIsotope.setConfiguration( modelState.getElementConfiguration() );
//        updatePossibleIsotopesList();
//
//        // Restore the interactivity mode.  We have to unhook our usual
//        // listener in order to avoid undesirable effects.
//        interactivityModeProperty.removeObserver( interactivityModeObserver );
//        interactivityModeProperty.set( modelState.getInteractivityMode() );
//        interactivityModeProperty.addObserver( interactivityModeObserver, false );
//
//        // Restore the mix mode.  The assertion here checks that the mix mode
//        // (i.e. nature's or user's mix) matches the value that is being
//        // restored.  This requirement is true as of 3/16/2011.  It is
//        // possible that it could change, but for now, it is good to test.
//        assert modelState.isShowingNaturesMix() == showingNaturesMixProperty.get();
//        showingNaturesMixProperty.set( modelState.isShowingNaturesMix() );
//
//        // Add any particles that were in the test chamber.
//        testChamber.setState( modelState.getIsotopeTestChamberState() );
//        for ( MovableAtom isotope : testChamber.getContainedIsotopes() ) {
//            isotope.addListener( isotopeGrabbedListener );
//            isotope.addedToModel();
//            notifyIsotopeInstanceAdded( isotope );
//        }
//
//        // Add the appropriate isotope controllers.  This will create the
//        // controllers in their initial states.
//        addIsotopeControllers();
//
//        // Set up the isotope controllers to match whatever is in the test
//        // chamber.
//        if ( interactivityModeProperty.get() == InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
//            // Remove isotopes from buckets based on the number in the test
//            // chamber.  This makes sense because in this mode, any isotopes
//            // in the chamber must have come from the buckets.
//            for ( ImmutableAtom isotopeConfig : possibleIsotopesProperty.get() ) {
//                int isotopeCount = testChamber.getIsotopeCount( isotopeConfig );
//                MonoIsotopeParticleBucket bucket = getBucketForIsotope( isotopeConfig );
//                for ( int i = 0; i < isotopeCount; i++ ) {
//                    MovableAtom removedIsotope = bucket.removeArbitraryIsotope();
//                    removedIsotope.removeListener( isotopeGrabbedListener );
//                    removedIsotope.removedFromModel();
//                }
//            }
//        }
//        else {
//            // Assume numerical controllers.
//            assert interactivityModeProperty.get() == InteractivityMode.SLIDERS_AND_SMALL_ATOMS;
//            // Set each controller to match the number in the chamber.
//            for ( ImmutableAtom isotopeConfig : possibleIsotopesProperty.get() ) {
//                NumericalIsotopeQuantityControl controller = getNumericalControllerForIsotope( isotopeConfig );
//                controller.setIsotopeQuantity( testChamber.getIsotopeCount( isotopeConfig ) );
//            }
//        }
//    }
//
//    /**
//     * Set the element that is currently in use, and for which all stable
//     * isotopes will be available for movement in and out of the test chamber.
//     * In case you're wondering why this is done as an atom instead of just
//     * setting the atomic number, it is so that this will play well with the
//     * existing controllers (such as the PeriodicTableControlNode) that
//     * already existed at the time this class was created.
//     */
//    public void setAtomConfiguration( IAtom atom ) {
//        // This method does NOT check if the specified atom is already the
//        // current configuration.  This allows it to be as a sort of reset
//        // routine.  For the sake of efficiency, callers should be careful not
//        // to call this when it isn't needed.
//
//        if ( showingNaturesMixProperty.get() ) {
//            removeAllIsotopesFromTestChamberAndModel();
//            prototypeIsotope.setConfiguration( atom );
//            updatePossibleIsotopesList();
//            showNaturesMix();
//        }
//        else {
//            // Save the user's mix state for the current element
//            // before transitioning to the new one.
//            if ( !atom.equals( prototypeIsotope.toImmutableAtom() ) ) {
//                mapIsotopeConfigToUserMixState.put( prototypeIsotope.getNumProtons(), getState() );
//            }
//
//            if ( mapIsotopeConfigToUserMixState.containsKey( atom.getNumProtons() ) ) {
//                // Restore the previously saved state for this element.
//                setState( mapIsotopeConfigToUserMixState.get( atom.getNumProtons() ) );
//            }
//            else {
//                // Clean up any previous isotopes.
//                removeAllIsotopesFromTestChamberAndModel();
//
//                // Update the prototype atom (a.k.a. isotope) configuration.
//                prototypeIsotope.setConfiguration( atom );
//                updatePossibleIsotopesList();
//
//                // Set all model elements for the first time this element's
//                // user mix is shown.
//                setUpInitialUsersMix();
//            }
//        }
//    }
//
//    /**
//     * Get a list of the possible isotopes, sorted from lightest to heaviest.
//     */
//    public void updatePossibleIsotopesList() {
//        // Get a list of all stable isotopes for the current atomic number.
//        ArrayList<ImmutableAtom> newIsotopeList = AtomIdentifier.getStableIsotopesOfElement( prototypeIsotope.getNumProtons() );
//
//        // Sort from lightest to heaviest.  Do not change this without careful
//        // considerations, since several areas of the code count on this.
//        Collections.sort( newIsotopeList, new Comparator<IAtom>() {
//            public int compare( IAtom atom2, IAtom atom1 ) {
//                return new Double( atom2.getAtomicMass() ).compareTo( atom1.getAtomicMass() );
//            }
//        } );
//
//        // Update the list of possible isotopes for this atomic configuration.
//        possibleIsotopesProperty.set( newIsotopeList );
//    }
//
//    /**
//     * Remove all buckets that are currently in the model, as well as the particles they contained.
//     */
//    private void removeBuckets() {
//        for ( MonoIsotopeParticleBucket bucket : bucketList ) {
//            for ( MovableAtom movableAtom : bucket.getContainedIsotopes() ) {
//                bucket.removeParticle( movableAtom );
//                movableAtom.removedFromModel();
//                movableAtom.removeListener( isotopeGrabbedListener );
//            }
//        }
//        ArrayList<MonoIsotopeParticleBucket> oldBuckets = new ArrayList<MonoIsotopeParticleBucket>( bucketList );
//        bucketList.clear();
//        for ( MonoIsotopeParticleBucket bucket : oldBuckets ) {
//            notifyBucketRemoved( bucket );
//        }
//    }
//
//    /**
//     * Set up the appropriate isotope controllers based on the currently
//     * selected element, the interactivity mode, and the mix setting (i.e.
//     * user's mix or nature's mix).  This will remove any existing
//     * controllers.  This will also add the appropriate initial number of
//     * isotopes to any buckets that are created.
//     */
//    private void addIsotopeControllers() {
//        // Remove existing controllers.
//        removeBuckets();
//        removeNumericalControllers();
//
//        final boolean buckets = interactivityModeProperty.get() == InteractivityMode.BUCKETS_AND_LARGE_ATOMS || showingNaturesMixProperty.get();
//        // Set up layout variables.
//        double controllerYOffset = testChamber.getTestChamberRect().getMinY() - 400;
//        double interControllerDistanceX;
//        double controllerXOffset;
//        if ( possibleIsotopesProperty.get().size() < 4 ) {
//            // We can fit 3 or less cleanly under the test chamber.
//            interControllerDistanceX = testChamber.getTestChamberRect().getWidth() / possibleIsotopesProperty.get().size();
//            controllerXOffset = testChamber.getTestChamberRect().getMinX() + interControllerDistanceX / 2;
//        }
//        else {
//            // Four controllers don't fit well under the chamber, so use a
//            // positioning algorithm where they are extended a bit to the
//            // right.
//            interControllerDistanceX = ( testChamber.getTestChamberRect().getWidth() * 1.2 ) / possibleIsotopesProperty.get().size();
//            controllerXOffset = testChamber.getTestChamberRect().getMinX() + interControllerDistanceX / 2;
//        }
//        // Add the controllers.
//        for ( int i = 0; i < possibleIsotopesProperty.get().size(); i++ ) {
//            ImmutableAtom isotopeConfig = possibleIsotopesProperty.get().get( i );
//            if ( buckets ) {
//                String bucketCaption = AtomIdentifier.getName( isotopeConfig ) + "-" + isotopeConfig.getMassNumber();
//                MonoIsotopeParticleBucket newBucket = new MonoIsotopeParticleBucket( new Point2D.Double(
//                        controllerXOffset + interControllerDistanceX * i, controllerYOffset ),
//                                                                                     BUCKET_SIZE, getColorForIsotope( isotopeConfig ), bucketCaption, LARGE_ISOTOPE_RADIUS,
//                                                                                     isotopeConfig.getNumProtons(), isotopeConfig.getNumNeutrons() );
//                addBucket( newBucket );
//                if ( !showingNaturesMixProperty.get() ) {
//                    // Create and add initial isotopes to the new bucket.
//                    for ( int j = 0; j < NUM_LARGE_ISOTOPES_PER_BUCKET; j++ ) {
//                        createAndAddIsotope( isotopeConfig, true );
//                    }
//                }
//            }
//            else {
//                // Assume a numerical controller.
//                NumericalIsotopeQuantityControl newController = new NumericalIsotopeQuantityControl( this, isotopeConfig, new Point2D.Double( controllerXOffset + interControllerDistanceX * i, controllerYOffset ) );
//                newController.setIsotopeQuantity( testChamber.getIsotopeCount( isotopeConfig ) );
//                numericalControllerList.add( newController );
//                notifyNumericalControllerAdded( newController );
//            }
//        }
//    }
//
//    private void addBucket( MonoIsotopeParticleBucket newBucket ) {
//        bucketList.add( newBucket );
//        notifyBucketAdded( newBucket );
//    }
//
//    private void removeNumericalControllers() {
//        ArrayList<NumericalIsotopeQuantityControl> oldControllers = new ArrayList<NumericalIsotopeQuantityControl>( numericalControllerList );
//        numericalControllerList.clear();
//        for ( NumericalIsotopeQuantityControl controller : oldControllers ) {
//            controller.removedFromModel();
//        }
//    }
//
//    /**
//     * Get the bucket where the given isotope can be placed.
//     *
//     * @param isotope
//     * @return A bucket that can hold the isotope if one exists, null if not.
//     */
//    private MonoIsotopeParticleBucket getBucketForIsotope( ImmutableAtom isotope ) {
//        MonoIsotopeParticleBucket isotopeBucket = null;
//        for ( MonoIsotopeParticleBucket bucket : bucketList ) {
//            if ( bucket.isIsotopeAllowed( isotope ) ) {
//                // Found it.
//                isotopeBucket = bucket;
//                break;
//            }
//        }
//        return isotopeBucket;
//    }
//
//    private NumericalIsotopeQuantityControl getNumericalControllerForIsotope( ImmutableAtom isotope ) {
//        NumericalIsotopeQuantityControl isotopeController = null;
//        for ( NumericalIsotopeQuantityControl controller : numericalControllerList ) {
//            if ( controller.getIsotopeConfig().equals( isotope ) ) {
//                // Found it.
//                isotopeController = controller;
//                break;
//            }
//        }
//        return isotopeController;
//    }
//
//    /**
//     * Get a reference to the test chamber model.
//     */
//    public IsotopeTestChamber getIsotopeTestChamber() {
//        return testChamber;
//    }
//
//    public Property<List<ImmutableAtom>> getPossibleIsotopesProperty() {
//        return possibleIsotopesProperty;
//    }
//
//    public Property<InteractivityMode> getInteractivityModeProperty() {
//        return interactivityModeProperty;
//    }
//
//    public BooleanProperty getShowingNaturesMixProperty() {
//        return showingNaturesMixProperty;
//    }
//
//    public Color getColorForIsotope( ImmutableAtom isotope ) {
//        int index = possibleIsotopesProperty.get().indexOf( isotope );
//        return index >= 0 ? ISOTOPE_COLORS[possibleIsotopesProperty.get().indexOf( isotope )] : Color.WHITE;
//    }
//
//    public void reset() {
//        // Reset all properties that need resetting.
//        showingNaturesMixProperty.reset();
//        interactivityModeProperty.reset();
//
//        // Remove any stored state for the default atom.
//        mapIsotopeConfigToUserMixState.remove( DEFAULT_PROTOTYPE_ISOTOPE_CONFIG.getNumProtons() );
//
//        // Set the default element.
//        setAtomConfiguration( DEFAULT_PROTOTYPE_ISOTOPE_CONFIG );
//
//        // Remove all stored user's mix states.  This must be done after
//        // setting the default isotope because state could have been saved
//        // when the default was set.
//        mapIsotopeConfigToUserMixState.clear();
//    }
//
//    public void addListener( Listener listener ) {
//        listeners.add( listener );
//    }
//
//    public void removeListener( Listener listener ) {
//        listeners.remove( listener );
//    }
//
//    protected void notifyIsotopeInstanceAdded( MovableAtom atom ) {
//        for ( Listener listener : listeners ) {
//            listener.isotopeInstanceAdded( atom );
//        }
//    }
//
//    private void notifyBucketAdded( MonoIsotopeParticleBucket bucket ) {
//        for ( Listener listener : listeners ) {
//            listener.isotopeBucketAdded( bucket );
//        }
//    }
//
//    private void notifyBucketRemoved( MonoIsotopeParticleBucket bucket ) {
//        for ( Listener listener : listeners ) {
//            listener.isotopeBucketRemoved( bucket );
//        }
//    }
//
//    private void notifyNumericalControllerAdded( NumericalIsotopeQuantityControl controller ) {
//        for ( Listener listener : listeners ) {
//            listener.isotopeNumericalControllerAdded( controller );
//        }
//    }
//
//    private void showNaturesMix() {
//        assert showingNaturesMixProperty.get() == true; // This method shouldn't be called if we're not showing nature's mix.
//
//        // Clear out anything that is in the test chamber.  If anything
//        // needed to be stored, it should have been done by now.
//        removeAllIsotopesFromTestChamberAndModel();
//
//        // Get the list of possible isotopes and then sort it by abundance
//        // so that the least abundant are added last, thus assuring that
//        // they will be visible.
//        ArrayList<ImmutableAtom> possibleIsotopesCopy = new ArrayList<ImmutableAtom>( getPossibleIsotopesProperty().get() );
//        Collections.sort( possibleIsotopesCopy, new Comparator<IAtom>() {
//            public int compare( IAtom atom2, IAtom atom1 ) {
//                return new Double( AtomIdentifier.getNaturalAbundance( atom1 ) ).compareTo( AtomIdentifier.getNaturalAbundance( atom2 ) );
//            }
//        } );
//
//        // Add the isotopes.
//        for ( ImmutableAtom isotopeConfig : possibleIsotopesCopy ) {
//            int numToCreate = (int) Math.round( NUM_NATURES_MIX_ATOMS * AtomIdentifier.getNaturalAbundance( isotopeConfig ) );
//            if ( numToCreate == 0 ) {
//                // The calculated quantity was 0, but we don't want to have
//                // no instances of this isotope in the chamber, so add only
//                // one.  This behavior was requested by the design team.
//                numToCreate = 1;
//            }
//            List<MovableAtom> isotopesToAdd = new ArrayList<MovableAtom>();
//            for ( int i = 0; i < numToCreate; i++ ) {
//                MovableAtom newIsotope = new MovableAtom(
//                        isotopeConfig.getNumProtons(),
//                        isotopeConfig.getNumNeutrons(),
//                        SMALL_ISOTOPE_RADIUS,
//                        testChamber.generateRandomLocation(),
//                        clock );
//                isotopesToAdd.add( newIsotope );
//                notifyIsotopeInstanceAdded( newIsotope );
//            }
//            testChamber.bulkAddIsotopesToChamber( isotopesToAdd );
//        }
//
//        // Add the isotope controllers (i.e. the buckets).
//        addIsotopeControllers();
//    }
//
//    /**
//     * Remove all isotopes from the test chamber, and then remove them from
//     * the model.  This method does not add removed isotopes back to the
//     * buckets or update the controllers.
//     */
//    private void removeAllIsotopesFromTestChamberAndModel() {
//        testChamber.removeAllIsotopes( true );
//    }
//
//    /**
//     * Remove the particles from the test chamber and set the state of the
//     * isotope controllers to be consistent.  This method retains the current
//     * interactivity mode, and thus the controllers.
//     */
//    public void clearTestChamber() {
//        for ( MovableAtom isotope : new ArrayList<MovableAtom>( testChamber.getContainedIsotopes() ) ) {
//            testChamber.removeIsotopeFromChamber( isotope );
//            if ( interactivityModeProperty.get() == InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
//                // Add isotope to bucket.
//                getBucketForIsotope( isotope.getAtomConfiguration() ).addIsotopeInstanceFirstOpen( isotope, true );
//            }
//            else {
//                // Remove isotope completely from the model.
//                isotope.removeListener( isotopeGrabbedListener );
//                isotope.removedFromModel();
//            }
//        }
//        // Force any numerical controllers that exist to update.
//        for ( NumericalIsotopeQuantityControl controller : numericalControllerList ) {
//            controller.syncToTestChamber();
//        }
//    }
//
//    // -----------------------------------------------------------------------
//    // Inner Classes and Interfaces
//    //------------------------------------------------------------------------
//
//    protected final SphericalParticle.Adapter isotopeGrabbedListener = new SphericalParticle.Adapter() {
//        @Override
//        public void grabbedByUser( SphericalParticle particle ) {
//            assert particle instanceof MovableAtom;
//            MovableAtom isotope = (MovableAtom) particle;
//            if ( testChamber.isIsotopeContained( isotope ) ) {
//                // The particle is considered removed from the test chamber as
//                // soon as it is grabbed.
//                testChamber.removeIsotopeFromChamber( isotope );
//            }
//            isotope.addListener( isotopeDroppedListener );
//        }
//    };
//
//    protected final SphericalParticle.Adapter isotopeDroppedListener = new SphericalParticle.Adapter() {
//        @Override
//        public void droppedByUser( SphericalParticle particle ) {
//            assert particle instanceof MovableAtom;
//            MovableAtom isotope = (MovableAtom) particle;
//            if ( testChamber.isIsotopePositionedOverChamber( isotope ) ) {
//                // Dropped inside the test chamber, so add it to the chamber,
//                // but make sure it isn't overlapping any existing particles.
//                testChamber.addIsotopeToChamber( isotope );
//                testChamber.adjustForOverlap();
//            }
//            else {
//                // Particle was dropped outside of the test chamber, so return
//                // it to the bucket.
//                MonoIsotopeParticleBucket bucket = getBucketForIsotope( isotope.getAtomConfiguration() );
//                assert bucket != null; // Should never have an isotope without a home.
//                bucket.addIsotopeInstanceNearestOpen( isotope, false );
//            }
//            particle.removeListener( isotopeDroppedListener );
//        }
//    };
//
//    public interface Listener {
//        void isotopeInstanceAdded( MovableAtom atom );
//
//        void isotopeBucketAdded( MonoIsotopeParticleBucket bucket );
//
//        void isotopeBucketRemoved( MonoIsotopeParticleBucket bucket );
//
//        void isotopeNumericalControllerAdded( NumericalIsotopeQuantityControl controller );
//    }
//
//    public static class Adapter implements Listener {
//        public void isotopeInstanceAdded( MovableAtom atom ) {
//        }
//
//        public void isotopeBucketAdded( MonoIsotopeParticleBucket bucket ) {
//        }
//
//        public void isotopeBucketRemoved( MonoIsotopeParticleBucket bucket ) {
//        }
//
//        public void isotopeNumericalControllerAdded( NumericalIsotopeQuantityControl controller ) {
//        }
//    }
//

//}
