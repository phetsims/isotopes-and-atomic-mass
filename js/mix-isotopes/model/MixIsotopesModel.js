// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model portion of "Mix Isotopes" module.  This model contains a mixture
 * of isotopes and allows a user to move various different isotopes in and
 * out of the "Isotope Test Chamber", and simply keeps track of the average
 * mass within the chamber.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 * @author Aadish Gupta
 */

define( function( require ) {
  'use strict';

  // modules
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Color = require( 'SCENERY/util/Color' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var PropertySet = require( 'AXON/PropertySet' );
  var MovableAtom = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MovableAtom' );
  var NumericalIsotopeQuantityControl = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/NumericalIsotopeQuantityControl' );
  var MonoIsotopeBucket = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MonoIsotopeBucket' );
  var IsotopeTestChamber = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/IsotopeTestChamber' );

  // constants
  // Default atom configuration.
  var DEFAULT_ATOM_CONFIG = new NumberAtom( { protonCount: 1, neutronCount: 0, electronCount: 1 } ); // Hydrogen.


  // -----------------------------------------------------------------------
  // Class Data
  // -----------------------------------------------------------------------

  // Default initial atom configuration.
  // Immutable atom
  var DEFAULT_PROTOTYPE_ISOTOPE_CONFIG = new NumberAtom( { protonCount: 1, neutronCount: 0, electronCount: 1 } );

  // Size of the buckets that will hold the isotopes.
  var BUCKET_SIZE = new Dimension2( 120, 50 );

  // Within this model, the isotopes come in two sizes, small and large, and
  // atoms are either one size or another, and all atoms that are shown at
  // a given time are all the same size.  The larger size is based somewhat
  // on reality.  The smaller size is used when we want to show a lot of
  // atoms at once.
  var LARGE_ISOTOPE_RADIUS = 10;
  var SMALL_ISOTOPE_RADIUS = 4;

  // Numbers of isotopes that are placed into the buckets when a new atomic
  // number is selected.
  var NUM_LARGE_ISOTOPES_PER_BUCKET = 10;

  // List of colors which will be used to represent the various isotopes.
  var ISOTOPE_COLORS = [ new Color( 180, 82, 205 ), Color.green, new Color( 255, 69, 0 ), new Color( 70, 130, 180 ) ];


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

  /**
   * Class that defines the state of the model.  This can be used for saving
   * and restoring of the state.
   *
   * @author John Blanco
   * @author James Smith
   */
  function State( model ) {
    this.elementConfig = new NumberAtom( {
      protonCount: model.prototypeIsotope.protonCount,
      neutronCount: model.prototypeIsotope.neutronCount,
      electronCount: model.prototypeIsotope.electronCount
    });
    this.isotopeTestChamberState = model.testChamber.getState();
    this.interactivityMode = model.interactivityMode;
    this.showingNaturesMix = model.showingNaturesMix;
  }

  /**
   * Constructor for the Mix Isotopes Model
   **/
  function MixIsotopesModel() {
    // Property that determines the type of user interactivity that is set.
    // See the enum definition for more information about the modes.

    PropertySet.call( this, {
      interactivityMode: InteractivityMode.BUCKETS_AND_LARGE_ATOMS,
      possibleIsotopes: [],    // This property contains the list of isotopes that exist in nature as
      // variations of the current "prototype isotope".  In other words, this
      // contains a list of all stable isotopes that match the atomic weight
      // of the currently configured isotope.  There should be only one of each
      // possible isotope.

      showingNaturesMix: false          // Property that determines whether the user's mix or nature's mix is
                                        // being displayed.  When this is set to true, indicating that nature's
                                        // mix should be displayed, the isotope size property is ignored.
    } );

    var self = this;

    this.numberAtom = new NumberAtom( {
      protonCount: DEFAULT_ATOM_CONFIG.protonCount,
      neutronCount: DEFAULT_ATOM_CONFIG.neutronCount,
      electronCount: DEFAULT_ATOM_CONFIG.electronCount
    } );

    // The test chamber into and out of which the isotopes can be moved.
    this.testChamber = new IsotopeTestChamber( this );

    // This atom is the "prototype isotope", meaning that it is set in order
    // to set the atomic weight of the family of isotopes that are currently
    // in use.
    this.prototypeIsotope = new NumberAtom( {
      protonCount: DEFAULT_ATOM_CONFIG.protonCount,
      neutronCount: DEFAULT_ATOM_CONFIG.neutronCount,
      electronCount: DEFAULT_ATOM_CONFIG.electronCount
  } );

    // List of the isotope buckets.
    this.bucketList = new ObservableArray();
    this.isotopesList = new ObservableArray();

    // List of the numerical controls that, when present, can be used to add
    // or remove isotopes to/from the test chamber.
    this.numericalControllerList = new ObservableArray();

    // Map of elements to user mixes.  These are restored when switching
    // between elements.  The integer represents the atomic number.
    this.mapIsotopeConfigToUserMixState = {};
    this.updatePossibleIsotopesList();

    this.numberAtom.on( 'atomUpdated', function() {
      self.setAtomConfiguration( self.numberAtom );
    });

    // Set the initial atom configuration.
    this.setAtomConfiguration( this.numberAtom );

    /*this.interactivityModeProperty.link( function() {
      self.interactivityModeObserver();
    } );*/

    // Listen to our own "showing nature's mix" property so that we can
    // show and hide the appropriate isotopes when the value changes.
    this.showingNaturesMixProperty.lazyLink( function() {
      if ( self.showingNaturesMix ) {
        // Get the current user's mix state.
        var usersMixState = self.getState();
        // Tweak the users mix state.  This is necessary since the
        // state is being saved inside a property change observer.
        usersMixState.showingNaturesMix = false;
        // Save the user's mix state.
        self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCount ] = usersMixState;
        // Display nature's mix.
        self.showNaturesMix();
      }
      else {
        if ( self.mapIsotopeConfigToUserMixState.hasOwnProperty( self.prototypeIsotope.protonCount ) ) {
          self.setState( self.mapIsotopeConfigToUserMixState[ self.prototypeIsotope.protonCount ] );
        }
        else {
          self.setUpInitialUsersMix();
        }
      }
    } );

    this.interactivityModeProperty.lazyLink( function(prop) {
      self.removeAllIsotopesFromTestChamberAndModel();
      self.addIsotopeControllers();

    } );
  }

  isotopesAndAtomicMass.register( 'MixIsotopesModel', MixIsotopesModel );

  return inherit( PropertySet, MixIsotopesModel, {

    _nucleusJumpCount: 0,
    // Main model step function, called by the framework.
    step: function( dt ) {
      // Update particle positions.
      this.isotopesList.forEach( function( neutron ) {
        neutron.step( dt );
      } );
    },
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

  placeIsotope: function( isotope, bucket, testChamber ) {
    if ( testChamber.isIsotopePositionedOverChamber( isotope ) ) {
      testChamber.addIsotopeToChamber( isotope, true );
      testChamber.adjustForOverlap();
    }
    else {
      bucket.addIsotopeInstanceNearestOpen( isotope, true );
    }
  },

  createAndAddIsotope: function( isotopeConfig, animate ) {
    assert && assert( isotopeConfig.protonCount === this.prototypeIsotope.protonCount, '179' );
    var self = this;
    var newIsotope;

      if ( this.interactivityMode === InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
        // Create the specified isotope and add it to the appropriate bucket.
        newIsotope = new MovableAtom( isotopeConfig.protonCount, isotopeConfig.neutronCount, new Vector2( 0, 0 ) );
        newIsotope.color = this.getColorForIsotope( isotopeConfig );
        newIsotope.massNumber = isotopeConfig.massNumber;
        newIsotope.protonCount = isotopeConfig.protonCount;

        // TODO Make sure this velocity looks good
        //newIsotope.velocity = ATOM_MOTION_SPEED;
        var bucket = this.getBucketForIsotope( isotopeConfig );
        bucket.addIsotopeInstanceFirstOpen( newIsotope, animate );
        newIsotope.userControlledProperty.link( function( userControlled ) {
          if ( !userControlled && !bucket.containsParticle( newIsotope ) ) {
            self.placeIsotope( newIsotope, bucket, self.testChamber );
          }
        } );
        this.isotopesList.add(newIsotope);
      }

      else {
        // Create the specified isotope and add it directly to the test chamber.
        var randomIsotopeLocation = this.testChamber.generateRandomLocation();
        newIsotope = new MovableAtom( isotopeConfig.protonCount, isotopeConfig.neutronCount, randomIsotopeLocation );

        this.testChamber.addIsotopeToChamber( newIsotope, true );
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
        }
      } );
      return isotopeBucket;
    },

    /**
     * Add newBucket to bucketList.
     *
     * @param {MonoIsotopeBucket} newBucket
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
      this.isotopesList.clear();
      this.showingNaturesMix = false;
      //this.interactivityMode = InteractivityMode.BUCKETS_AND_LARGE_ATOMS;
      delete this.mapIsotopeConfigToUserMixState[ this.prototypeIsotope.protonCount ];
      this.addIsotopeControllers();
    },

    /**
     * Returns the prototypeIsotope
     * @returns {NumberAtom} prototypeIsotope
     */
    getAtom: function() {
      return this.prototypeIsotope;
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
      //this.removeAllIsotopesFromTestChamberAndModel();

      // Restore the prototype isotope.
      this.prototypeIsotope = modelState.elementConfig;
      this.updatePossibleIsotopesList();

      // Restore the interactivity mode.  We have to unhook our usual
      // listener in order to avoid undesirable effects.
      // TODO Can I just say the interactivityModeObserver for this or do I need to put it inside another function?
      var thisModel = this;

      // Make sure that the unlinking and re-linking of the interactivityModeObserver is behaving as expected.
      /*this.interactivityModeProperty.unlink( function() {
        thisModel.interactivityModeObserver();
      } );*/

      this.interactivityModeProperty.set( modelState.interactivityMode );

      /*this.interactivityModeProperty.link( function() {
        thisModel.interactivityModeObserver();
      } );*/


      // Restore the mix mode.  The assertion here checks that the mix mode
      // (i.e. nature's or user's mix) matches the value that is being
      // restored.  This requirement is true as of 3/16/2011.  It is
      // possible that it could change, but for now, it is good to test.
      assert && assert( modelState.showingNaturesMix === this.showingNaturesMix );
      this.showingNaturesMix =  modelState.showingNaturesMix;

      // Add any particles that were in the test chamber.
      this.testChamber.setState( modelState.isotopeTestChamberState );
      this.testChamber.containedIsotopes.forEach( function( isotope ) {
        thisModel.isotopesList.add(isotope);
      } );

      // Add the appropriate isotope controllers.  This will create the
      // controllers in their initial states.
       this.addIsotopeControllers();

      // Set up the isotope controllers to match whatever is in the test
      // chamber.
      if ( this.interactivityMode === InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
        // Remove isotopes from buckets based on the number in the test
        // chamber.  This makes sense because in this mode, any isotopes
        // in the chamber must have come from the buckets.
        // @param {NumberAtom} isotopeConfig
        // var thisModel = this; TODO Check and make sure that this is ok
        this.possibleIsotopes.forEach( function( isotopeConfig ) {
          var isotopeCount = thisModel.testChamber.getIsotopeCount( isotopeConfig );
          var bucket = thisModel.getBucketForIsotope( isotopeConfig );
          for ( var i = 0; i < isotopeCount; i++ ) {
            var removedIsotope = bucket.removeArbitraryIsotope();
            thisModel.isotopesList.remove( removedIsotope );
          }
        } );
      }

    },


    /**
     * Set the element that is currently in use, and for which all stable
     * isotopes will be available for movement in and out of the test chamber.
     * In case you're wondering why this is done as an atom instead of just
     * setting the atomic number, it is so that this will play well with the
     * existing controllers (such as the PeriodicTableControlNode) that
     * already existed at the time this class was created.
     *
     * @param {NumberAtom} atom
     */
    setAtomConfiguration: function( atom ) {
      // This method does NOT check if the specified atom is already the
      // current configuration.  This allows it to be as a sort of reset
      // routine.  For the sake of efficiency, callers should be careful not
      // to call this when it isn't needed.

      this.isotopesList.clear();
      if ( this.numberAtom !== atom ) {
        this.numberAtom.protonCount = atom.protonCount;
        this.numberAtom.electronCount = atom.electronCount;
        this.numberAtom.neutronCount = atom.neutronCount;
      }

      if ( this.showingNaturesMix ) {
        this.removeAllIsotopesFromTestChamberAndModel();
        this.prototypeIsotope = atom;
        this.updatePossibleIsotopesList();
        this.showNaturesMix();
      }
      else {
        // Save the user's mix state for the current element
        // before transitioning to the new one.
        if ( this.prototypeIsotope !== atom ) {
          this.mapIsotopeConfigToUserMixState[ this.prototypeIsotope.protonCount ] = this.getState();
        }

        if ( this.mapIsotopeConfigToUserMixState.hasOwnProperty( atom.protonCount ) ) {
          // Restore the previously saved state for this element.
          this.setState( this.mapIsotopeConfigToUserMixState[ atom.protonCount ] );
        }
        else {
          // Clean up any previous isotopes.
          this.removeAllIsotopesFromTestChamberAndModel();

          // Update the prototype atom (a.k.a. isotope) configuration.
          // prototypeIsotope.setConfiguration( atom );
          this.prototypeIsotope.protonCount = atom.protonCount;
          this.prototypeIsotope.neutronCount = atom.neutronCount;
          this.prototypeIsotope.electronCount = atom.electronCount;
          this.updatePossibleIsotopesList();

          // Set all model elements for the first time this element's
          // user mix is shown.
          this.setUpInitialUsersMix();
        }
      }
    },


    /**
     * Get a list of the possible isotopes, sorted from lightest to heaviest.
     */
    updatePossibleIsotopesList: function() {
      var stableIsotopes = AtomIdentifier.getStableIsotopesOfElement( this.prototypeIsotope.protonCount );
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
      //Sort from lightest to heaviest.  Do not change this without careful
      //considerations, since several areas of the code count on this.
      // This is kept in case someone adds another isotope to AtomIdentifier and doesn't add it in order.
      newIsotopesList.sort( function( atom1, atom2 ) {
        return atom1.getIsotopeAtomicMass() - atom2.getIsotopeAtomicMass();
      } );

      // Update the list of possible isotopes for this atomic configuration.
      this.possibleIsotopes = newIsotopesList;
    },


    /**
     * Remove all buckets that are currently in the model, as well as the particles they contained.
     */
    removeBuckets: function() {
      this.bucketList.forEach( function( bucket ) {
        bucket.reset();
      } );


      // TODO Remove? var oldBuckets = this.bucketList;
      this.bucketList.clear();
      //for ( MonoIsotopeParticleBucket bucket : oldBuckets ) {
      //  notifyBucketRemoved( bucket );
      //}
    },

    /**
     * Set up the appropriate isotope controllers based on the currently
     * selected element, the interactivity mode, and the mix setting (i.e.
     * user's mix or nature's mix).  This will remove any existing
     * controllers.  This will also add the appropriate initial number of
     * isotopes to any buckets that are created.
     */
    addIsotopeControllers: function() {
      // Remove existing controllers.
      var self = this;
      this.removeBuckets();
      this.removeNumericalControllers();

      var buckets = this.interactivityMode === InteractivityMode.BUCKETS_AND_LARGE_ATOMS || this.showingNaturesMix;
      // Set up layout variables.
      var controllerYOffset = -210 ;
      var interControllerDistanceX;
      var controllerXOffset;
      if ( this.possibleIsotopes.length < 4 ) {
        // We can fit 3 or less cleanly under the test chamber.
        interControllerDistanceX = this.testChamber.getTestChamberRect().getWidth() / this.possibleIsotopes.length;
        controllerXOffset = this.testChamber.getTestChamberRect().minX + interControllerDistanceX / 2;
      }
      else {
        // Four controllers don't fit well under the chamber, so use a
        // positioning algorithm where they are extended a bit to the
        // right.
        interControllerDistanceX = ( this.testChamber.getTestChamberRect().getWidth() * 1.15 ) / this.possibleIsotopes.length;
        //controllerXOffset = this.testChamber.getTestChamberRect().minX + interControllerDistanceX / 2;
        controllerXOffset = -175;
      }
      // Add the controllers.
      for ( var i = 0; i < this.possibleIsotopes.length; i++ ) {
        // {MovableAtom}
        var isotopeConfig = this.possibleIsotopes[ i ];
        var isotopeCaption = AtomIdentifier.getName( isotopeConfig.protonCount ) + '-' + isotopeConfig.massNumber;
        if ( buckets ) {
          var newBucket = new MonoIsotopeBucket( new Vector2( controllerXOffset + interControllerDistanceX * i, controllerYOffset ),
            BUCKET_SIZE, this.getColorForIsotope( isotopeConfig ), isotopeCaption, LARGE_ISOTOPE_RADIUS,
            isotopeConfig.protonCount, isotopeConfig.neutronCount );
          this.addBucket( newBucket );
          if ( !this.showingNaturesMix ) {
            // Create and add initial isotopes to the new bucket.
            _.times( NUM_LARGE_ISOTOPES_PER_BUCKET, function() {
              self.createAndAddIsotope( isotopeConfig, false );
            });
          }
        }
        else {
          // Assume a numerical controller.
          var newController = new NumericalIsotopeQuantityControl( this, isotopeConfig,
            new Vector2( controllerXOffset + interControllerDistanceX * i, controllerYOffset ),
            isotopeCaption );
          var controllerIsotope = new MovableAtom( isotopeConfig.protonCount, isotopeConfig.neutronCount, new Vector2( 0, 0 ) );
          controllerIsotope.color = self.getColorForIsotope( isotopeConfig );
          controllerIsotope.radius = SMALL_ISOTOPE_RADIUS;
          newController.controllerIsotope = controllerIsotope;
          this.numericalControllerList.add( newController );
        }
      }
    },

    removeNumericalControllers: function() {
      var oldControllers = this.numericalControllerList;
      this.numericalControllerList.clear();
      // TODO Is this necessary?
      oldControllers.forEach( function( controller ) {
        controller.removedFromModel();
      } );
    },

    /**
     * @param {MovableAtom} isotope
     * @return {NumericalIsotopeQuantityControl} isotopeController
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
     *
     * @param {NumberAtom} isotope
     */
    getColorForIsotope: function( isotope ) {
      var index = this.possibleIsotopes.indexOf( isotope );
      return index >= 0 ? ISOTOPE_COLORS[ this.possibleIsotopes.indexOf( isotope ) ] : Color.WHITE;
    },

    /**
     *
     * @returns {}
     */
    showNaturesMix: function() {
      var self = this;
      this.isotopesList.clear();
      assert && assert( this.showingNaturesMix === true ); // This method shouldn't be called if we're not showing nature's mix.

      // Clear out anything that is in the test chamber.  If anything
      // needed to be stored, it should have been done by now.
      this.removeAllIsotopesFromTestChamberAndModel();

      // Get the list of possible isotopes and then sort it by abundance
      // so that the least abundant are added last, thus assuring that
      // they will be visible.
      //{NumberAtom[]}
      var possibleIsotopesCopy = this.possibleIsotopes.slice( 0 );
      possibleIsotopesCopy.sort( function( atom1, atom2 ) {
        return AtomIdentifier.getNaturalAbundance( atom2 ) - AtomIdentifier.getNaturalAbundance( atom1 );
      } );

      // Add the isotopes.
      possibleIsotopesCopy.forEach( function (isotopeConfig) {
        var numToCreate = Math.round( NUM_NATURES_MIX_ATOMS * AtomIdentifier.getNaturalAbundance( isotopeConfig ) );
        if ( numToCreate === 0 ) {
          // The calculated quantity was 0, but we don't want to have
          // no instances of this isotope in the chamber, so add only
          // one.  This behavior was requested by the design team.
          numToCreate = 1;
        }
          // { MovableAtom[] }
        var isotopesToAdd = [];
        for ( var i = 0; i < numToCreate; i++ ) {
          var newIsotope = new MovableAtom( isotopeConfig.protonCount, isotopeConfig.neutronCount, self.testChamber.generateRandomLocation() );
          newIsotope.color = self.getColorForIsotope( isotopeConfig );
          newIsotope.massNumber = isotopeConfig.massNumber;
          newIsotope.protonCount = isotopeConfig.protonCount;
          newIsotope.radius = SMALL_ISOTOPE_RADIUS;
          newIsotope.showLabel = false;
          isotopesToAdd.push( newIsotope );
          self.isotopesList.add( newIsotope );
            // notifyIsotopeInstanceAdded( newIsotope );
        }
        self.testChamber.bulkAddIsotopesToChamber( isotopesToAdd );
      });

      // Add the isotope controllers (i.e. the buckets).
      this.addIsotopeControllers();


    },




    /**
     * Remove all isotopes from the test chamber, and then remove them from
     * the model.  This method does not add removed isotopes back to the
     * buckets or update the controllers.
     */
    // TODO Check back on this
    removeAllIsotopesFromTestChamberAndModel: function() {
      this.testChamber.removeAllIsotopes( true );
      this.isotopesList.clear();
    },

    clearBox: function() {
      this.removeAllIsotopesFromTestChamberAndModel();
      this.addIsotopeControllers();
    },

    /**
     * Resets the model. Returns the default settings.
     */
    reset: function() {
      PropertySet.prototype.reset.call( this );

      // Remove any stored state for the default atom.
      delete this.mapIsotopeConfigToUserMixState[ DEFAULT_PROTOTYPE_ISOTOPE_CONFIG.protonCount ];

      // Set the default element.
      this.setAtomConfiguration( DEFAULT_PROTOTYPE_ISOTOPE_CONFIG );

      // Remove all stored user's mix states.  This must be done after
      // setting the default isotope because state could have been saved
      // when the default was set.
      this.mapIsotopeConfigToUserMixState = {};
    },


    /**
     * Remove the particles from the test chamber and set the state of the
     * isotope controllers to be consistent.  This method retains the current
     * interactivity mode, and thus the controllers.
     */
    clearTestChamber: function() {
      // To prevent any scope issues with forEach loops.
      var thisModel = this;
      this.testChamber.getContainedIsotopes().forEach( function( isotope ) {
        thisModel.testChamber.removeIsotopeFromChamber( isotope );
        if ( thisModel.interactivityMode === InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
          // Add isotope to bucket.
          this.getBucketForIsotope( isotope.atomConfiguration ).addIsotopeInstanceFirstOpen( isotope, true );
        }
        else {
          // Remove isotope completely from model.
          isotope.removedFromModel();
        }
      } );

      // Force any numerical controllers that exist to update.
      this.numericalControllerList.forEach( function( controller ) {
        controller.syncToTestChamber();
      } );
    },


    /**
     * This is an observer that watches our own interactivity mode setting.
     * It is declared as a member variable so that it can be "unhooked" in
     * circumstances where it is necessary.
     */
    interactivityModeObserver: function() {
      // TODO get this function ported
      assert && assert( this.showingNaturesMix === false ); // Interactivity mode shouldn't change when showing nature's mix.
      if ( this.mapIsotopeConfigToUserMixState.hasOwnProperty( this.prototypeIsotope.protonCount ) ) {
        // Erase any previous state for this isotope.
        // TODO this is giving error
        //this.mapIsotopeConfigToUserMixState.delete( this.prototypeIsotope.protonCount );
      }
      //this.removeAllIsotopesFromTestChamberAndModel();
    }

  } );

} );
