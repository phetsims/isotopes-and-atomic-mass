/**
 * Copyright 2002-2015, University of Colorado
 *
 * Class that represents a "test chamber" where multiple isotopes can be
 * placed.  The test chamber calculates the average atomic mass and the
 * proportions of the various isotopes.  It is intended to be contained in
 * the main model class.
 *
 * @author John Blanco
 * @author James Smith
 */

define( function( require ) {
  'use strict';

  //modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Rectangle = require( 'SCENERY/NODES/Rectangle' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var NumberAtom = require( 'SHRED/model/NumberAtom' );
  var MovableAtom = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MovableAtom' );


  // ------------------------------------------------------------------------
  // Class Data
  // ------------------------------------------------------------------------

  // Size of the "test chamber", which is the area in model space into which
  // the isotopes can be dragged in order to contribute to the current
  // average atomic weight.
  var SIZE = new Dimension2( 3500, 3000 ); // In picometers.

  // Rectangle that defines the location of the test chamber.  This is
  // set up so that the center of the test chamber is at (0, 0) in model
  // space.
  var TEST_CHAMBER_RECT = new Rectangle( -SIZE.width / 2, -SIZE.height / 2, SIZE.width, SIZE.height );


  /**
   * @constructor
   * @param {MixIsotopeModel} model
   *
   */
  var test = null;

  function IsotopeTestChamber( model ) {

    // Isotope Mixtures Model that contains this test chamber.
    this.model = model;

    // {MovableAtom} Observable array that keeps track of the isotopes in the chamber and is updated as isotopes
    // come and go.
    // @public
    this.containedIsotopes = new ObservableArray();

    PropertySet.call( this, {
      isotopeCount: 0,
      averageAtomicMass: 0
    } );

  }

  /**
   * Class that contains the state of the isotope test chamber, and can be
   * used for saving and later restoring the state.
   * TODO This class was previously defined in the methods, but due to restrictions about defining classes in the
   * TODO inherit call it was moved outside of the call.
   */
  var thisChamber = this; // Designed to prevent scope errors through the definition of methods. TODO Remove other repetitive definitions.

  function State( isotopeTestChamber ) {
    this.containedIsotopes = new ObservableArray( isotopeTestChamber.getContainedIsotopes() ) || null;

    this.getContainedIsotopes = function() {
      return this.containedIsotopes;
    }
  }


  return inherit( PropertySet, IsotopeTestChamber, {
    /**
     * Get the number of isotopes currently in the chamber that match the
     * specified configuration.
     *
     * @param {NumberAtom} isotopeConfig
     * @return {number} isotopeCount
     */
    getIsotopeCount: function( isotopeConfig ) {
      assert && assert( isotopeConfig.protonCount === isotopeConfig.electronCount ); // Should always be neutral atom.
      var isotopeCount = 0;
      this.containedIsotopes.forEach( function( isotope ) {
        if ( isotope.atomConfiguration.equals( isotopeConfig ) ) {
          isotopeCount++;
        }
      } );
      return isotopeCount;
    },

    /**
     *
     * @returns {Rectangle} TEST_CHAMBER_RECT
     */
    getTestChamberRect: function() {
      return TEST_CHAMBER_RECT;
    },

    /**
     * Test whether an isotope is within the chamber.  This is strictly
     * a 2D test that looks as the isotopes center position and determines
     * if it is within the bounds of the chamber rectangle.
     *
     * @param {MovableAtome} isotope
     * @return {boolean}
     */
    isIsotopePositionedOverChamber: function( isotope ) {
      return TEST_CHAMBER_RECT.containsPointSelf( isotope.position );
    },

    /**
     * Returns true if the specified isotope instance is contained by the
     * chamber.  Note that it is possible for an isotope to be positioned
     * within the chamber bounds but not contained by it.
     *
     * @param {MovableAtom} isotope
     * @return {boolean}
     */
    isIsotopeContained: function( isotope ) {
      return this.containedIsotopes.contains( isotope );
    },

    ///**
    // * Add the specified isotope to the test chamber.  The isotope must be
    // * positioned within the 2D bounds of the chamber or the request will be
    // * ignored.
    // *
    // * @param {MovableAtom} isotope
    // * TODO Decide whether or not we should keep this. It seems redundant.
    // */
    //addIsotopeToChamber: function( isotope ) {
    //  addIsotopeToChamber( isotope, true );
    //},

    /**
     * Add the specified isotope to the chamber.  This method requires
     * that the position of the isotope be within the chamber rectangle,
     * or the isotope will not be added.
     *
     * In cases where an isotope is in a position where the center is
     * within the chamber but the edges are not, the isotope will be moved
     * so that it is fully contained within the chamber.
     *
     * @param {MovableAtom} isotope        - Isotope to add.
     * @param {boolean} performUpdates - Flag that can be set be used to suppress updates.
     *                       This is generally done for performance reasons when adding a large
     *                       number of isotopes at once.
     */
    addIsotopeToChamber: function( isotope, performUpdates ) {
      if ( this.isIsotopePositionedOverChamber( isotope ) ) {
        this.containedIsotopes.push( isotope );
        // If the edges of the isotope are outside of the container,
        // move it to be fully inside.
        var protrusion = isotope.position.x + isotope.radius - TEST_CHAMBER_RECT.bounds.maxX;
        if ( protrusion >= 0 ) {
          isotope.setPositionAndDestination( new Vector2( isotope.position.x - protrusion, isotope.position.y ) );
        }
        else {
          protrusion = TEST_CHAMBER_RECT.bounds.minX - ( isotope.position.x - isotope.radius );
          if ( protrusion >= 0 ) {
            isotope.setPositionAndDestination( new Vector2( isotope.position.x + protrusion, isotope.position.y ) );
          }
        }
        protrusion = isotope.position.y + isotope.radius - TEST_CHAMBER_RECT.bounds.maxY;
        if ( protrusion >= 0 ) {
          isotope.setPositionAndDestination( new Vector2( isotope.position.x, isotope.position.y - protrusion ) );
        }
        else {
          protrusion = TEST_CHAMBER_RECT.bounds.minY - ( isotope.position.y - isotope.radius );
          if ( protrusion >= 0 ) {
            isotope.setPositionAndDestination( isotope.position.x, isotope.position.y + protrusion );
          }
        }
        if ( performUpdates ) {
          // Update the isotope count.
          this.updateCountProperty();
          // Update the average atomic mass.
          this.averageAtomicMass = ( ( this.averageAtomicMass * ( this.isotopeCount - 1 ) ) + isotope.atomConfiguration.getIsotopeAtomicMass() ) /
                                   this.isotopeCount;
        }
      }
      else {
        // This isotope is not positioned correctly.
        console.error( ' - Warning: Ignoring attempt to add incorrectly located isotope to test chamber. ' );
      }
    },


    /**
     * Adds a list of isotopes to the test chamber. Same restrictions as above.
     *
     * @param {MovableAtom[]} isotopeList
     */

    bulkAddIsotopesToChamber: function( isotopeList ) {
      for ( var isotope in isotopeList ) {
        this.addIsotopeToChamber( isotope, false );
      }
      this.updateCountProperty();
      this.updateAverageAtomicMassProperty();
    },

    /**
     * Convenience function to set the isotopeCount property equal to the number of isotopes contained in this test chamber.
     */
    updateCountProperty: function() {
      this.isotopeCount = this.containedIsotopes.length;
    },

    updateAverageAtomicMassProperty: function() {
      if ( this.containedIsotopes.length > 0 ) {
        var totalMass = 0;
        this.containedIsotopes.forEach( function( isotope ) {
          totalMass += isotope.atomConfiguration.getIsotopeAtomicMass();
        } );

        this.averageAtomicMass = totalMass / this.containedIsotopes.length;
      }
      else {
        this.averageAtomicMass = 0;
      }
    },

    /**
     * @param {MovableAtom} isotope
     */
    removeIsotopeFromChamber: function( isotope ) {
      this.containedIsotopes.remove( isotope );
      this.updateCountProperty();
      // Update the average atomic mass.
      if ( this.isotopeCount > 0 ) {
        this.averageAtomicMass = ( this.averageAtomicMass * ( this.isotopeCount + 1 )
                                   - isotope.atomConfiguration.getIsotopeAtomicMass() ) / this.isotopeCount;
      }
      else {
        this.averageAtomicMass = 0;
      }
    },


    /**
     * Remove an isotope from the chamber that matches the specified atom
     * configuration.  Note that electrons are ignored.
     *
     * @param {NumberAtom} isotopeConfig
     * @return {MovableAtom} removedIsotope
     */
    removeIsotopeMatchingConfig: function( isotopeConfig ) {
      // Argument checking.
      if ( ( isotopeConfig.protonCount - isotopeConfig.electronCount ) != 0 ) {
        console.error( 'Isotope must be neutral' );
      }
      // Locate and remove a matching isotope.
      var removedIsotope = null;
      this.containedIsotopes.forEach( function( isotope ) {
        if ( isotope.equals( isotopeConfig ) ) {
          removedIsotope = isotope;
          //TODO What is the proper way to introduce a break here because it seems like javascript isn't viewing our forEach as an actual loop to break out of
          // break;
        }
      } )

      this.removeIsotopeFromChamber( removedIsotope );
      return removedIsotope;
    },

    /**
     * Removes all isotopes and their listeners from the model one at a time.
     *
     * @param {boolean} removeFromModel
     */

    removeAllIsotopes: function( removeFromModel ) {
      var containedIsotopesCopy = this.containedIsotopes;
      this.containedIsotopes.clear();
      if ( removeFromModel ) {
        this.containedIsotopes.forEach( function( isotope ) {
          // TODO Couldn't find the isotopeGrabbedListener
          isotope.removeListener( this.model.isotopeGrabbedListener );
          isotope.removedFromModel();

        } )

      }
      this.updateCountProperty();
      this.averageAtomicMass = 0;

      assert && assert( this.isotopeCount === 0 );      // Logical consistency check.
      assert && assert( this.averageAtomicMass === 0 ); // Logical consistency check.
    },

    // TODO Originally this would return a protected array in java
    getContainedIsotopes: function() {
      return this.containedIsotopes;
    },


    /**
     * Get a count of the total number of isotopes in the chamber.
     *
     * @return {number}
     */
    getTotalIsotopeCount: function() {
      return this.isotopeCount;
    },

    //
    ///**
    // * TODO Look over with Jesse
    // * @param {SimpleObserver} so
    // */
    //addTotalCountChangeObserver: function( so ) {
    //  this.isotopeCount.addObserver( so );
    //}

    /**
     * Get the proportion of isotopes currently within the chamber that
     * match the specified configuration.  Note that electrons are
     * ignored.
     *
     * @param {NumberAtom} isotopeConfig - Atom representing the configuration in
     *                      question, MUST BE NEUTRAL.
     * @return {number} isotopeProportion
     * TODO TEST
     */
    getIsotopeProportion: function( isotopeConfig ) {
      assert && assert( isotopeConfig.protonCount - isotopeConfig.electronCount === 0 );
      var isotopeCount = 0;
      debugger;
      this.containedIsotopes.forEach( function( isotope ) {
        if ( isotopeConfig.equals( isotope.atomConfiguration ) ) {
          isotopeCount++;
        }
      } )

      return isotopeCount / this.containedIsotopes.length;
    },


    /**
     * Move all the particles in the chamber such that they don't overlap.
     * This is intended for usage where there are not a lot of particles in
     * the chamber.  Using it in cases where there are a lost of particles
     * could take a very long time.
     */
    adjustForOverlap: function() {
      // Bounds checking.  The threshold is pretty much arbitrary.
      if ( this.getTotalIsotopeCount() > 100 ) {
        console.error( " - Warning: Ignoring request to adjust for overlap - too many particles in the chamber for that." );
        return;
      }

      // Check for overlap and adjust particle positions until none exists.
      var maxIterations = 10000;
      for ( var i = 0; this.checkForParticleOverlap() && i < maxIterations; i++ ) {
        // Adjustment factors for the repositioning algorithm.
        var interParticleForceConst = 2000;
        var wallForceConst = interParticleForceConst * 10;
        var minInterParticleDistance = 0.0001;
        // TODO Decide whether or not we still need this since we are looping through the obs
        var mapIsotopesToForces = {};
        var mapIsotopesIDToIsotope = {};

        var thisChamber = this; //Prevents any scope error when using this.

        this.containedIsotopes.forEach( function( isotope1 ) {

          var totalForce = new Vector2( 0, 0 );
          //Calculate the force due to other isotopes
          for ( var j = 0; j < thisChamber.containedIsotopes.length; j++ ) {
            var isotope2 = thisChamber.containedIsotopes.get( j );
            if ( isotope1 === isotope2 ) {
              continue;

            }
            var forceFromIsotope = new Vector2( 0, 0 );
            var distanceBetweenIsotopes = isotope1.position.distance( isotope2.position );
            if ( distanceBetweenIsotopes === 0 ) {
              // These isotopes are sitting right on top of one
              // another.  Add the max amount of inter-particle
              // force in a random direction.
              forceFromIsotope.setPolar( interParticleForceConst / ( minInterParticleDistance * minInterParticleDistance ), Math.random() * 2 * Math.PI );

            }
            else if ( distanceBetweenIsotopes < isotope1.radius + isotope2.radius ) {
              // Calculate the repulsive force based on the distance.
              forceFromIsotope.setComponents(
                isotope1.position.x - isotope2.position.x,
                isotope1.position.y - isotope2.position.y );
              var distance = Math.max( forceFromIsotope.magnitude(), minInterParticleDistance );
              forceFromIsotope.normalize();
              forceFromIsotope.scale( interParticleForceConst / ( distance * distance ) );
            }
            totalForce.add( forceFromIsotope );
          }

          // Calculate the force due to the walls.  This prevents
          // particles from being pushed out of the bounds of the
          // chamber.
          if ( isotope1.position.x + isotope1.radius >= TEST_CHAMBER_RECT.bounds.maxX ) {
            var distanceFromRightWall = TEST_CHAMBER_RECT.bounds.maxX - isotope1.position.x;
            totalForce.add( new Vector2( -wallForceConst / ( distanceFromRightWall * distanceFromRightWall ), 0 ) );
          }
          else if ( isotope1.position.x - isotope1.radius <= TEST_CHAMBER_RECT.bounds.minX ) {
            var distanceFromLeftWall = isotope1.position.x - TEST_CHAMBER_RECT.bounds.minX;
            totalForce.add( new Vector2( wallForceConst / ( distanceFromLeftWall * distanceFromLeftWall ), 0 ) );
          }
          if ( isotope1.position.y + isotope1.radius >= TEST_CHAMBER_RECT.bounds.maxY ) {
            var distanceFromTopWall = TEST_CHAMBER_RECT.bounds.maxY - isotope1.position.y;
            totalForce.add( new Vector2( 0, -wallForceConst / ( distanceFromTopWall * distanceFromTopWall ) ) );
          }
          else if ( isotope1.position.y - isotope1.radius <= TEST_CHAMBER_RECT.bounds.minY ) {
            var distanceFromBottomWall = isotope1.position.y - TEST_CHAMBER_RECT.bounds.minY;
            totalForce.add( new Vector2( 0, wallForceConst / ( distanceFromBottomWall * distanceFromBottomWall ) ) );
          }

          // Put the calculated repulsive force into the map.
          mapIsotopesToForces[ isotope1.instanceCount ] = totalForce;
          mapIsotopesIDToIsotope[ isotope1.instanceCount ] = isotope1;

        } );

        // Adjust the particle positions based on forces.
        for ( var isotopeID in mapIsotopesToForces ) {
          if ( mapIsotopesToForces.hasOwnProperty( isotopeID ) ) {
            // TODO This is setting the new position to the force vector
            mapIsotopesIDToIsotope[ isotopeID ].setPositionAndDestination( mapIsotopesToForces[ isotopeID ] );
          }

        }
        if ( i === maxIterations - 1 ) {
          console.error( '- Warning: Hit max iterations of repositioning algorithm.' );
        }
      }
    },

    /**
     * Checks to ensure that particles are not overlapped.
     *
     * @returns {boolean}
     */

    checkForParticleOverlap: function() {
      var thisChamber = this;
      var overlapCheck = false;

      thisChamber.containedIsotopes.forEach( function( isotope1 ) {
        for ( var i = 0; i < thisChamber.containedIsotopes.length; i++ ) {
          var isotope2 = thisChamber.containedIsotopes.get( i );
          if ( isotope1 === isotope2 ) {
            // Same isotope so skip it!
            continue;
          }

          var distance = isotope1.position.distance( isotope2.position );
          if ( distance < isotope1.radius + isotope2.radius ) {
            return overlapCheck = true;
          }
        }
      } );

      return overlapCheck;
    },


    /**
     * Generate a random location within the test chamber.
     *
     * @return {Vector2}
     */
    generateRandomLocation: function() {
      return new Vector2(
        TEST_CHAMBER_RECT.bounds.minX + Math.random() * TEST_CHAMBER_RECT.width,
        TEST_CHAMBER_RECT.bounds.minY + Math.random() * TEST_CHAMBER_RECT.height );
    },

    getState: function() {
      return new State( this );
    },


    /**
     * Restore a previously captured state
     * @param {State} state
     */
    setState: function( state ) {
      this.removeAllIsotopes( true );
      this.bulkAddIsotopesToChamber( state.getContainedIsotopes() );
    }


  } );
} )
;




