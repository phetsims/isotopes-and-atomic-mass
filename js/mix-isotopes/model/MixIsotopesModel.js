// Copyright 2014-2017, University of Colorado Boulder

/**
 * Model portion of "Mix Isotopes" module. This model contains a mixture of isotopes and allows a user to move various
 * different isotopes in and out of the "Isotope Test Chamber", and simply keeps track of the average mass within the chamber.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 * @author Aadish Gupta
 */

define( function( require ) {
  'use strict';

  // modules
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var IsotopeTestChamber = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/IsotopeTestChamber' );
  var MonoIsotopeBucket = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MonoIsotopeBucket' );
  var MovableAtom = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MovableAtom' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );
  var NumericalIsotopeQuantityControl = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/NumericalIsotopeQuantityControl' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var DEFAULT_ATOM_CONFIG = new NumberAtom( { protonCount: 1, neutronCount: 0, electronCount: 1 } ); // Hydrogen.
  var BUCKET_SIZE = new Dimension2( 120, 50 ); // Size of the buckets that will hold the isotopes.

  // Within this model, the isotopes come in two sizes, small and large, and atoms are either one size or another,
  // and all atoms that are shown at a given time are all the same size. The larger size is based somewhat on reality.
  // The smaller size is used when we want to show a lot of atoms at once.
  var LARGE_ISOTOPE_RADIUS = 10;
  var SMALL_ISOTOPE_RADIUS = 4;
  var NUM_LARGE_ISOTOPES_PER_BUCKET = 10; // Numbers of isotopes that are placed into the buckets

  // List of colors which will be used to represent the various isotopes.
  var ISOTOPE_COLORS = [ new Color( 180, 82, 205 ), Color.green, new Color( 255, 69, 0 ), new Color( 72, 137, 161 ) ];

  /*
   * Enum of the possible interactivity types. The user is dragging large isotopes between the test chamber and a set of
   * buckets. The user is adding and removing small isotopes to/from the chamber using sliders.
   */
  var InteractivityMode = {
    BUCKETS_AND_LARGE_ATOMS: 'BUCKETS_AND_LARGE_ATOMS',
    SLIDERS_AND_SMALL_ATOMS: 'SLIDERS_AND_SMALL_ATOMS'
  };
  var NUM_NATURES_MIX_ATOMS = 1000; // Total number of atoms placed in the chamber when depicting nature's mix.

  /**
   * Function that defines the state of the model. This will be used for saving and restoring of the state.
   * @param {MixIsotopesModel} model
   */
  function State( model ) {
    var self = this;
    this.elementConfig = new NumberAtom( {
      protonCount: model.prototypeIsotope.protonCountProperty.get(),
      neutronCount: model.prototypeIsotope.neutronCountProperty.get(),
      electronCount: model.prototypeIsotope.electronCountProperty.get()
    } );
    this.isotopeTestChamberState = model.testChamber.getState();
    this.interactivityMode = model.interactivityModeProperty.get();
    this.showingNaturesMix = model.showingNaturesMixProperty.get();
    this.bucketList = new ObservableArray();
    model.bucketList.forEach( function( bucket ) {
      var newBucket = bucket;
      newBucket.particles = [];
      bucket._particles.forEach( function( particle ) {
        newBucket.particles.push( particle );
      } );
      self.bucketList.add( newBucket );
    } );
  }

  /**
   * Constructor for the Mix Isotopes Model
   * @constructor
   **/
  function MixIsotopesModel() {

    // Property that determines the type of user interactivity that is set.
    this.interactivityModeProperty = new Property( InteractivityMode.BUCKETS_AND_LARGE_ATOMS ); // @public

    // This property contains the list of isotopes that exist in nature as variations of the current "prototype isotope".
    // In other words, this contains a list of all stable isotopes that match the atomic weight of the currently
    // configured isotope. There should be only one of each possible isotope.
    this.possibleIsotopesProperty = new Property( [] ); // @public {Read-Only}

    // Property that determines whether the user's mix or nature's mix is being displayed.
    this.showingNaturesMixProperty = new Property( false ); // @public

    var self = this; // @private

    // @public - events emitted by instances of this type
    this.naturesIsotopeUpdated = new Emitter();

    // @public
    this.numberAtom = new NumberAtom( {
      protonCount: DEFAULT_ATOM_CONFIG.protonCountProperty.get(),
      neutronCount: DEFAULT_ATOM_CONFIG.neutronCountProperty.get(),
      electronCount: DEFAULT_ATOM_CONFIG.electronCountProperty.get()
    } );

    // The test chamber into and out of which the isotopes can be moved.
    this.testChamber = new IsotopeTestChamber( this ); // @public

    this.prototypeIsotope = new NumberAtom(); // @private

    // List of the isotope buckets.
    this.bucketList = new ObservableArray(); // @public
    this.isotopesList = new ObservableArray(); // @public
    this.naturesIsotopesList = new ObservableArray(); // @public

    // List of the numerical controls that, when present, can be used to add or remove isotopes to/from the test chamber.
    this.numericalControllerList = new ObservableArray(); // @public

    // Map of elements to user mixes. These are restored when switching between elements.
    this.mapIsotopeConfigToUserMixState = {}; // @private
    this.updatePossibleIsotopesList();

    this.numberAtom.atomUpdated.addListener( function() {
      self.setAtomConfiguration( self.numberAtom );
    } );

    // Set the initial atom configuration.
    this.setAtomConfiguration( this.numberAtom );

    // Listen to "showing nature's mix" property and show/hide the appropriate isotopes when the value changes.
    // Doesn't need unlink as it stays through out the sim life
    this.showingNaturesMixProperty.lazyLink( function() {
      if ( self.showingNaturesMixProperty.get() ) {
        // Get the current user's mix state.
        var usersMixState = self.getState();
        // Tweak the users mix state. This is necessary since the state is being saved inside a property change observer.
        usersMixState.showingNaturesMix = false;
        // Save the user's mix state.
        if ( self.mapIsotopeConfigToUserMixState.hasOwnProperty( self.prototypeIsotope.protonCountProperty.get() ) ) {
          self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCountProperty.get() ][ self.interactivityModeProperty.get() ] =
            usersMixState;
        } else {
          self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCountProperty.get() ] = {};
          self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCountProperty.get() ][ self.interactivityModeProperty.get() ] =
            usersMixState;
        }
        // Display nature's mix.
        self.showNaturesMix();
      } else {
        self.naturesIsotopesList.clear();
        if ( self.mapIsotopeConfigToUserMixState.hasOwnProperty( self.prototypeIsotope.protonCountProperty.get() ) ) {
          if ( self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCountProperty.get() ]
            .hasOwnProperty( self.interactivityModeProperty.get() ) ) {
            self.setState(
              self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCountProperty.get() ][ self.interactivityModeProperty.get() ]
            );
          } else {
            self.setUpInitialUsersMix();
          }
        } else {
          self.setUpInitialUsersMix();
        }
      }
    } );

    // Doesn't need unlink as it stays through out the sim life
    this.interactivityModeProperty.lazyLink( function( value, oldValue ) {
      var usersMixState = self.getState();
      usersMixState.interactivityMode = oldValue;
      if ( self.mapIsotopeConfigToUserMixState.hasOwnProperty( self.prototypeIsotope.protonCountProperty.get() ) ) {
        self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCountProperty.get() ][ oldValue ] = usersMixState;
      } else {
        self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCountProperty.get() ] = {};
        self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCountProperty.get() ][ oldValue ] = usersMixState;
      }

      if ( self.mapIsotopeConfigToUserMixState.hasOwnProperty( self.prototypeIsotope.protonCountProperty.get() ) ) {
        if ( self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCountProperty.get() ].hasOwnProperty( value ) ) {
          self.setState( self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCountProperty.get() ][ value ] );
        } else {
          self.removeAllIsotopesFromTestChamberAndModel();
          self.addIsotopeControllers();
        }
      }
    } );
  }

  isotopesAndAtomicMass.register( 'MixIsotopesModel', MixIsotopesModel );

  return inherit( Object, MixIsotopesModel, {

    _nucleusJumpCount: 0,
    // Main model step function, called by the framework.
    // @public
    step: function( dt ) {
      // Update particle positions.
      this.isotopesList.forEach( function( isotope ) {
        isotope.step( dt );
      } );
    },

    /**
     * Create and add an isotope of the specified configuration.  Where the
     * isotope is initially placed depends upon the current interactivity mode.
     * @param {NumberAtom} isotope
     * @param {MonoIsotopeBucket} bucket
     * @param {IsotopeTestChamber} testChamber
     *
     * @private
     */
    placeIsotope: function( isotope, bucket, testChamber ) {
      if ( testChamber.isIsotopePositionedOverChamber( isotope ) ) {
        testChamber.addIsotopeToChamber( isotope, true );
        testChamber.adjustForOverlap();
      } else {
        bucket.addIsotopeInstanceNearestOpen( isotope, true );
      }
    },

    // @public
    createAndAddIsotope: function( isotopeConfig, animate ) {
      var self = this;
      var newIsotope;
      if ( this.interactivityModeProperty.get()=== InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
        // Create the specified isotope and add it to the appropriate bucket.
        newIsotope = new MovableAtom(
          isotopeConfig.protonCountProperty.get(),
          isotopeConfig.neutronCountProperty.get(), new Vector2( 0, 0 )
        );
        newIsotope.color = this.getColorForIsotope( isotopeConfig );
        newIsotope.massNumber = isotopeConfig.massNumberProperty.get();
        newIsotope.protonCount = isotopeConfig.protonCountProperty.get();

        var bucket = this.getBucketForIsotope( isotopeConfig );
        bucket.addIsotopeInstanceFirstOpen( newIsotope, animate );
        // Does not require Unlink
        newIsotope.userControlledProperty.link( function( userControlled ) {
          if ( !userControlled && !bucket.containsParticle( newIsotope ) ) {
            self.placeIsotope( newIsotope, bucket, self.testChamber );
          }
        } );
        this.isotopesList.add( newIsotope );
      }
      return newIsotope;
    },

    /**
     * Get the bucket where the given isotope can be placed.
     * @param {NumberAtom} isotope
     * @returns {MonoIsotopeBucket} A bucket that can hold the isotope if one exists, null if not.
     *
     * @public
     */
    getBucketForIsotope: function( isotope ) {
      var isotopeBucket = null;
      this.bucketList.forEach( function( bucket ) {
        if ( bucket.isIsotopeAllowed( isotope.protonCountProperty.get(), isotope.neutronCountProperty.get() ) ) {
          // Found it.
          isotopeBucket = bucket;
        }
      } );
      return isotopeBucket;
    },

    /**
     * Add newBucket to bucketList.
     *
     * @param {MonoIsotopeBucket} newBucket
     *
     * @private
     */

    addBucket: function( newBucket ) {
      this.bucketList.push( newBucket );
    },

    /**
     * Set up the initial user's mix for the currently configured element. This should set all state variables to be
     * consistent with the display of the initial users mix. This is generally called the first time an element is
     * selected after initialization or reset.
     *
     * @public
     */
    setUpInitialUsersMix: function() {
      this.removeAllIsotopesFromTestChamberAndModel();
      this.showingNaturesMixProperty.set( false );
      this.addIsotopeControllers();
    },

    /**
     * Returns the prototypeIsotope
     * @returns {NumberAtom} prototypeIsotope
     *
     * @public
     */
    getAtom: function() {
      return this.prototypeIsotope;
    },

    /**
     * Returns the state of the model.
     *
     * @private
     */
    getState: function() {
      return new State( this );
    },

    /**
     * Set the state of the model based on a previously created state representation.
     * @param {State} modelState
     *
     * @private
     */
    setState: function( modelState ) {
      // Clear out any particles that are currently in the test chamber.
      this.removeAllIsotopesFromTestChamberAndModel();

      // Restore the prototype isotope.
      this.prototypeIsotope = modelState.elementConfig;
      this.updatePossibleIsotopesList();

      var self = this;

      assert && assert( modelState.showingNaturesMix === this.showingNaturesMixProperty.get() );
      this.showingNaturesMixProperty.set( modelState.showingNaturesMix );

      // Add any particles that were in the test chamber.
      this.testChamber.setState( modelState.isotopeTestChamberState );
      this.testChamber.containedIsotopes.forEach( function( isotope ) {
        self.isotopesList.add( isotope );
      } );

      // Add the appropriate isotope controllers. This will create the controllers in their initial states.
      this.addIsotopeControllers();

      // Set up the isotope controllers to match whatever is in the test chamber.
      if ( this.interactivityModeProperty.get() === InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
        // Remove isotopes from buckets based on the number in the test chamber. This makes sense because in this mode,
        // any isotopes in the chamber must have come from the buckets.
        self.removeBuckets();
        modelState.bucketList.forEach( function( bucket ) {
          self.bucketList.add( bucket );
          bucket.particles.forEach( function( isotope ) {
            bucket.addParticleFirstOpen( isotope, false );
            self.isotopesList.add( isotope );
          } );
        } );
      }
    },

    /**
     * Set the element that is currently in use, and for which all stable isotopes will be available for movement in and
     * out of the test chamber. In case you're wondering why this is done as an atom instead of just setting the atomic
     * number, it is so that this will play well with the existing controllers that already existed at the time this
     * class was created.
     *
     * @param {NumberAtom} atom
     *
     * @public
     */
    setAtomConfiguration: function( atom ) {
      // This method does NOT check if the specified atom is already the current configuration. This allows it to be as
      // a sort of reset routine.
      // For the sake of efficiency, callers should be careful not to call this when it isn't needed.

      if ( this.numberAtom !== atom ) {
        this.numberAtom.protonCountProperty.set( atom.protonCountProperty.get() );
        this.numberAtom.electronCountProperty.set( atom.electronCountProperty.get() );
        this.numberAtom.neutronCountProperty.set( atom.neutronCountProperty.get() );
      }

      if ( this.showingNaturesMixProperty.get() ) {
        this.removeAllIsotopesFromTestChamberAndModel();
        this.prototypeIsotope.protonCountProperty.set( atom.protonCountProperty.get() );
        this.prototypeIsotope.neutronCountProperty.set( atom.neutronCountProperty.get() );
        this.prototypeIsotope.electronCountProperty.set( atom.electronCountProperty.get() );
        this.updatePossibleIsotopesList();
        this.showNaturesMix();
      } else {
        // Save the user's mix state for the current element before transitioning to the new one.
        if ( this.prototypeIsotope !== atom ) {
          if ( this.mapIsotopeConfigToUserMixState.hasOwnProperty( this.prototypeIsotope.protonCountProperty.get() ) ) {
            this.mapIsotopeConfigToUserMixState[ this.prototypeIsotope.protonCountProperty.get() ][ this.interactivityModeProperty.get() ] = this.getState();
          } else {
            this.mapIsotopeConfigToUserMixState[ this.prototypeIsotope.protonCountProperty.get() ] = {};
            this.mapIsotopeConfigToUserMixState[ this.prototypeIsotope.protonCountProperty.get() ][ this.interactivityModeProperty.get() ] = this.getState();
          }
        }
        if ( this.mapIsotopeConfigToUserMixState.hasOwnProperty( atom.protonCountProperty.get() ) ) {
          if ( this.mapIsotopeConfigToUserMixState[ atom.protonCountProperty.get() ].hasOwnProperty(
              this.interactivityModeProperty.get() ) ) {
            // Restore the previously saved state for this element.
            this.setState( this.mapIsotopeConfigToUserMixState[ atom.protonCountProperty.get() ][ this.interactivityModeProperty.get() ] );
          } else {
            // Clean up any previous isotopes.
            this.removeAllIsotopesFromTestChamberAndModel();

            this.prototypeIsotope.protonCountProperty.set( atom.protonCountProperty.get() );
            this.prototypeIsotope.neutronCountProperty.set( atom.neutronCountProperty.get() );
            this.prototypeIsotope.electronCountProperty.set( atom.electronCountProperty.get() );
            this.updatePossibleIsotopesList();

            // Set all model elements for the first time this element's user mix is shown.
            this.setUpInitialUsersMix();
          }
        } else {
          // Clean up any previous isotopes.
          this.removeAllIsotopesFromTestChamberAndModel();

          this.prototypeIsotope.protonCountProperty.set( atom.protonCountProperty.get() );
          this.prototypeIsotope.neutronCountProperty.set( atom.neutronCountProperty.get() );
          this.prototypeIsotope.electronCountProperty.set( atom.electronCountProperty.get() );
          this.updatePossibleIsotopesList();

          // Set all model elements for the first time this element's user mix is shown.
          this.setUpInitialUsersMix();
        }
      }
    },


    /**
     * Get a list of the possible isotopes, sorted from lightest to heaviest.
     *
     * @private
     */
    updatePossibleIsotopesList: function() {
      var stableIsotopes = AtomIdentifier.getStableIsotopesOfElement( this.prototypeIsotope.protonCountProperty.get() );
      var newIsotopesList = [];
      for ( var index in stableIsotopes ) {
        if ( stableIsotopes.hasOwnProperty( index ) ) {
          newIsotopesList.push( new NumberAtom( {
            protonCount: stableIsotopes[ index ][ 0 ],
            neutronCount: stableIsotopes[ index ][ 1 ],
            electronCount: stableIsotopes[ index ][ 2 ]
          } ) );
        }
      }
      // Sort from lightest to heaviest. Do not change this without careful considerations, since several areas of the
      // code count on this. This is kept in case someone adds another isotope to AtomIdentifier and doesn't add it
      // in order.
      newIsotopesList.sort( function( atom1, atom2 ) {
        return atom1.getIsotopeAtomicMass() - atom2.getIsotopeAtomicMass();
      } );

      // Update the list of possible isotopes for this atomic configuration.
      this.possibleIsotopesProperty.set( newIsotopesList );
    },

    /**
     * Remove all buckets that are currently in the model, as well as the particles they contained.
     *
     * @public
     */
    removeBuckets: function() {
      var self = this;
      this.bucketList.forEach( function( bucket ) {
        bucket._particles.forEach( function( isotope ) {
          self.isotopesList.remove( isotope );
        } );
        bucket.reset();
      } );
      this.bucketList.clear();
    },

    /**
     * Set up the appropriate isotope controllers based on the currently selected element, the interactivity mode, and
     * the mix setting (i.e. user's mix or nature's mix). This will remove any existing controllers. This will also add
     * the appropriate initial number of isotopes to any buckets that are created.
     *
     * @public
     */
    addIsotopeControllers: function() {
      // Remove existing controllers.
      var self = this;
      this.removeBuckets();
      this.removeNumericalControllers();

      var buckets = this.interactivityModeProperty.get() === InteractivityMode.BUCKETS_AND_LARGE_ATOMS ||
                    this.showingNaturesMixProperty.get();
      // Set up layout variables.
      var controllerYOffsetBucket = -250; //emprically determined
      var controllerYOffsetSlider = -238; //empirically determined
      var interControllerDistanceX;
      var controllerXOffset;
      if ( this.possibleIsotopesProperty.get().length < 4 ) {
        // We can fit 3 or less cleanly under the test chamber.
        interControllerDistanceX = this.testChamber.getTestChamberRect().getWidth() / this.possibleIsotopesProperty.get().length;
        controllerXOffset = this.testChamber.getTestChamberRect().minX + interControllerDistanceX / 2;
      } else {
        // Four controllers don't fit well under the chamber, so use a positioning algorithm where they are extended
        // a bit to the right.
        interControllerDistanceX = ( this.testChamber.getTestChamberRect().getWidth() * 1.10 ) /
          this.possibleIsotopesProperty.get().length;
        controllerXOffset = -180;
      }
      // Add the controllers.
      for ( var i = 0; i < this.possibleIsotopesProperty.get().length; i++ ) {
        var isotopeConfig = this.possibleIsotopesProperty.get()[ i ];
        var isotopeCaption = AtomIdentifier.getName( isotopeConfig.protonCountProperty.get() )
                             + '-' + isotopeConfig.massNumberProperty.get();
        if ( buckets ) {
          var newBucket = new MonoIsotopeBucket( isotopeConfig.protonCountProperty.get(),
            isotopeConfig.neutronCountProperty.get(), {
            position: new Vector2( controllerXOffset + interControllerDistanceX * i, controllerYOffsetBucket ),
            size: BUCKET_SIZE,
            baseColor: this.getColorForIsotope( isotopeConfig ),
              captionText: isotopeCaption,
            sphereRadius: LARGE_ISOTOPE_RADIUS
          } );
          this.addBucket( newBucket );
          if ( !this.showingNaturesMixProperty.get() ) {
            // Create and add initial isotopes to the new bucket.
            _.times( NUM_LARGE_ISOTOPES_PER_BUCKET, function() {
              self.createAndAddIsotope( isotopeConfig, false );
            } );
          }
        } else {
          // Assume a numerical controller.
          var newController = new NumericalIsotopeQuantityControl( this, isotopeConfig,
            new Vector2( controllerXOffset + interControllerDistanceX * i, controllerYOffsetSlider ),
            isotopeCaption );
          var controllerIsotope = new MovableAtom( isotopeConfig.protonCountProperty.get(),
            isotopeConfig.neutronCountProperty.get(),
            new Vector2( 0, 0 ) );
          controllerIsotope.color = self.getColorForIsotope( isotopeConfig );
          controllerIsotope.radiusProperty.set( SMALL_ISOTOPE_RADIUS );
          newController.controllerIsotope = controllerIsotope;
          this.numericalControllerList.add( newController );
        }
      }
    },

    // @public
    removeNumericalControllers: function() {
      this.numericalControllerList.clear();
    },

    /**
     * @param {MovableAtom} isotope
     * @returns {NumericalIsotopeQuantityControl} isotopeController
     *
     * @public
     */
    getNumericalControllerForIsotope: function( isotope ) {
      var isotopeController = null;
      this.numericalControllerList.forEach( function( controller ) {
        if ( controller.isotopeConfig.equals( isotope ) ) {
          // Found it.
          isotopeController = controller;
          return isotopeController;
        }
      } );
      return isotopeController;
    },

    /**
     * @param {NumberAtom} isotope
     *
     * @public
     */
    getColorForIsotope: function( isotope ) {
      var index = this.possibleIsotopesProperty.get().indexOf( isotope );
      return index >= 0 ? ISOTOPE_COLORS[ this.possibleIsotopesProperty.get().indexOf( isotope ) ] : Color.WHITE;
    },

    // @private
    showNaturesMix: function() {
      var self = this;
      assert && assert( this.showingNaturesMixProperty.get() === true );

      // Clear out anything that is in the test chamber. If anything needed to be stored, it should have been done by now.
      this.removeAllIsotopesFromTestChamberAndModel();
      self.naturesIsotopesList.clear();

      // Get the list of possible isotopes and then sort it by abundance so that the least abundant are added last, thus
      // assuring that they will be visible.
      var possibleIsotopesCopy = this.possibleIsotopesProperty.get().slice( 0 );
      var numDigitsForComparison = 10;
      possibleIsotopesCopy.sort( function( atom1, atom2 ) {
        return AtomIdentifier.getNaturalAbundance( atom2, numDigitsForComparison ) -
               AtomIdentifier.getNaturalAbundance( atom1, numDigitsForComparison );
      } );

      // Add the isotopes.
      possibleIsotopesCopy.forEach( function( isotopeConfig ) {
        var numToCreate = Util.roundSymmetric(
          NUM_NATURES_MIX_ATOMS * AtomIdentifier.getNaturalAbundance( isotopeConfig, 5 )
        );
        if ( numToCreate === 0 ) {
          // The calculated quantity was 0, but we don't want to have no instances of this isotope in the chamber, so
          // add only one. This behavior was requested by the design team.
          numToCreate = 1;
        }
        var isotopesToAdd = [];
        for ( var i = 0; i < numToCreate; i++ ) {
          var newIsotope = new MovableAtom( isotopeConfig.protonCountProperty.get(), isotopeConfig.neutronCountProperty.get(),
            self.testChamber.generateRandomLocation() );
          newIsotope.color = self.getColorForIsotope( isotopeConfig );
          newIsotope.massNumber = isotopeConfig.massNumberProperty.get();
          newIsotope.protonCount = isotopeConfig.protonCountProperty.get();
          newIsotope.radiusProperty.set( SMALL_ISOTOPE_RADIUS );
          newIsotope.showLabel = false;
          isotopesToAdd.push( newIsotope );
          self.naturesIsotopesList.push( newIsotope );
        }
        self.testChamber.bulkAddIsotopesToChamber( isotopesToAdd );
      } );
      this.naturesIsotopeUpdated.emit();

      // Add the isotope controllers (i.e. the buckets).
      this.addIsotopeControllers();
    },

    /**
     * Remove all isotopes from the test chamber, and then remove them from the model. This method does not add removed
     * isotopes back to the buckets or update the controllers.
     *
     * @public
     */
    removeAllIsotopesFromTestChamberAndModel: function() {
      var self = this;
      if ( this.isotopesList.length > 0 ) {
        this.testChamber.containedIsotopes.forEach( function( isotope ) {
          self.isotopesList.remove( isotope );
        } );
      }
      this.testChamber.removeAllIsotopes( true );
    },

    // @public
    clearBox: function() {
      this.removeAllIsotopesFromTestChamberAndModel();
      this.addIsotopeControllers();
    },

    /**
     * Resets the model. Returns the default settings.
     *
     * @public
     */
    reset: function() {
      this.clearBox();

      // Remove any stored state for the default atom.
      // before clearing up the state clearing all the observable array stored in it

      this.mapIsotopeConfigToUserMixState = {};

      this.naturesIsotopesList.clear();

      this.interactivityModeProperty.reset();
      this.possibleIsotopesProperty.reset();
      this.showingNaturesMixProperty.reset();

      this.prototypeIsotope = new NumberAtom();
      // Set the default element
      this.setAtomConfiguration( DEFAULT_ATOM_CONFIG );

      // Remove all stored user's mix states.  This must be done after setting the default isotope because state could
      // have been saved when the default was set.
      this.mapIsotopeConfigToUserMixState = {};
    }
  }, { // statics
    InteractivityMode: InteractivityMode
  } );
} );

