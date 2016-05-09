// Copyright 2015, University of Colorado Boulder

/**
 * Class that represents a "test chamber" where multiple isotopes can be placed. The test chamber calculates the
 * average atomic mass and the proportions of the various isotopes. It is intended to be contained in the
 * main model class.
 *
 * @author John Blanco
 * @author James Smith
 * @author Aadish Gupta
 */

define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Random = require( 'DOT/Random' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  // Size of the "test chamber", which is the area in model space into which the isotopes can be dragged in order to
  // contribute to the current average atomic weight.
  var SIZE = new Dimension2( 450, 280 ); // In picometers.

  // Rectangle that defines the location of the test chamber. This is set up so that the center of the test chamber is
  // at (0, 0) in model space.
  var TEST_CHAMBER_RECT = new Rectangle( -SIZE.width / 2, -SIZE.height / 2, SIZE.width, SIZE.height );
  var BUFFER = 1; // isotopes stroke doesn't cross the wall, empirically determined


  /**
   * Utility Function that contains the state of the isotope test chamber, and can be used for saving and later restoring
   * the state.
   *
   * @param {IsotopeTestChamber} model
   */
  function State( model ) {
    var self = this;
    this.containedIsotopes = new ObservableArray();
    model.containedIsotopes.forEach( function( isotope ) {
      self.containedIsotopes.add( isotope );
    });
  }

  /**
   * @constructor
   * @param {MixIsotopesModel} model
   *
   */
  function IsotopeTestChamber( model ) {
    // Isotope Mixtures Model that contains this test chamber.
    this.model = model; // @private

    this.random = new Random(); // @private

    // {MovableAtom} Observable array that keeps track of the isotopes in the chamber and is updated as isotopes come and go.
    // @public
    this.containedIsotopes = new ObservableArray();

    PropertySet.call( this, {
      // @public {Read-Only}
      isotopeCount: 0,
      averageAtomicMass: 0
    } );

  }

  isotopesAndAtomicMass.register( 'IsotopeTestChamber', IsotopeTestChamber );
  return inherit( PropertySet, IsotopeTestChamber, {
    /**
     * Get the number of isotopes currently in the chamber that match the specified configuration.
     *
     * @param {NumberAtom} isotopeConfig
     * @return {number} isotopeCount
     * @public
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
     * @returns {Rectangle} TEST_CHAMBER_RECT
     * @public
     */
    getTestChamberRect: function() {
      return TEST_CHAMBER_RECT;
    },

    /**
     * Test whether an isotope is within the chamber. This is strictly a 2D test that looks as the isotopes center
     * position and determines if it is within the bounds of the chamber rectangle.
     *
     * @param {MovableAtom} isotope
     * @return {boolean}
     * @public
     */
    isIsotopePositionedOverChamber: function( isotope ) {
      return TEST_CHAMBER_RECT.containsPoint( isotope.position );
    },

    /**
     * Add the specified isotope to the chamber.  This method requires
     * that the position of the isotope be within the chamber rectangle,
     * or the isotope will not be added.
     *
     * In cases where an isotope is in a position where the center is
     * within the chamber but the edges are not, the isotope will be moved
     * so that it is fully contained within the chamber.
     *
     * @param {MovableAtom} isotope
     * @param {boolean} performUpdates - Flag that can be set be used to suppress updates.
     *
     * @public
     */
    addIsotopeToChamber: function( isotope, performUpdates ) {
      var self = this;
      if ( this.isIsotopePositionedOverChamber( isotope ) ) {
        this.containedIsotopes.push( isotope );

        var isotopeRemovedListener = function( userControlled ) {
          if ( userControlled && self.containedIsotopes.contains( isotope ) ) {
            self.removeIsotopeFromChamber( isotope );
          }
          isotope.userControlledProperty.unlink( isotopeRemovedListener );
        };
        isotope.userControlledProperty.lazyLink( isotopeRemovedListener );

        // If the edges of the isotope are outside of the container, move it to be fully inside.
        var protrusion = isotope.position.x + isotope.radius - TEST_CHAMBER_RECT.maxX + BUFFER;
        if ( protrusion >= 0 ) {
          isotope.setPositionAndDestination( new Vector2( isotope.position.x - protrusion, isotope.position.y ) );
        }
        else {
          protrusion = TEST_CHAMBER_RECT.minX + BUFFER - ( isotope.position.x - isotope.radius );
          if ( protrusion >= 0 ) {
            isotope.setPositionAndDestination( new Vector2( isotope.position.x + protrusion, isotope.position.y ) );
          }
        }
        protrusion = isotope.position.y + isotope.radius - TEST_CHAMBER_RECT.maxY + BUFFER;
        if ( protrusion >= 0 ) {
          isotope.setPositionAndDestination( new Vector2( isotope.position.x, isotope.position.y - protrusion ) );
        }
        else {
          protrusion = TEST_CHAMBER_RECT.minY + BUFFER - ( isotope.position.y - isotope.radius );
          if ( protrusion >= 0 ) {
            isotope.setPositionAndDestination( new Vector2( isotope.position.x, isotope.position.y + protrusion ) );
          }
        }
        if ( performUpdates ) {
          // Update the isotope count.
          this.updateCountProperty();
          // Update the average atomic mass.
          this.averageAtomicMass = ( ( this.averageAtomicMass * ( this.isotopeCount - 1 ) ) +
                                     isotope.atomConfiguration.getIsotopeAtomicMass() ) / this.isotopeCount;
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
     *
     * @public
     */
    bulkAddIsotopesToChamber: function( isotopeList ) {
      var self = this;
      isotopeList.forEach( function( isotope ) {
        self.addIsotopeToChamber( isotope, false );
      } );
      this.updateCountProperty();
      this.updateAverageAtomicMassProperty();
    },

    /**
     * Convenience function to set the isotopeCount property equal to the number of isotopes contained in this test chamber.
     *
     * @private
     */
    updateCountProperty: function() {
      this.isotopeCount = this.containedIsotopes.length;
    },

    // @private
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
     *
     * @public
     */
    removeIsotopeFromChamber: function( isotope ) {
      this.containedIsotopes.remove( isotope );
      this.updateCountProperty();
      // Update the average atomic mass.
      if ( this.isotopeCount > 0 ) {
        this.averageAtomicMass = ( this.averageAtomicMass * ( this.isotopeCount + 1 ) -
                                   isotope.atomConfiguration.getIsotopeAtomicMass() ) / this.isotopeCount;
      }
      else {
        this.averageAtomicMass = 0;
      }
    },


    /**
     * Remove an isotope from the chamber that matches the specified atom configuration. Note that electrons are ignored.
     *
     * @param {NumberAtom} isotopeConfig
     * @return {MovableAtom} removedIsotope
     *
     * @public
     */
    removeIsotopeMatchingConfig: function( isotopeConfig ) {
      assert && assert( ( isotopeConfig.protonCount - isotopeConfig.electronCount ) === 0 );

      // Locate and remove a matching isotope.
      var removedIsotope = null;
      this.containedIsotopes.forEach( function( isotope ) {
        if ( isotope.atomConfiguration.equals( isotopeConfig ) ) {
          removedIsotope = isotope;
          return;
        }
      } );
      this.removeIsotopeFromChamber( removedIsotope );
      return removedIsotope;
    },

    /**
     * Removes all isotopes
     *
     * @public
     */
    removeAllIsotopes: function( ) {
      this.containedIsotopes.clear();
      this.updateCountProperty();
      this.averageAtomicMass = 0;
    },

    /**
     * Returns the containedIsotopes.
     * @returns {ObservableArray}
     *
     * @public
     */
    getContainedIsotopes: function() {
      return this.containedIsotopes;
    },

    /**
     * Get a count of the total number of isotopes in the chamber.
     * @return {number}
     * @public
     */
    getTotalIsotopeCount: function() {
      return this.isotopeCount;
    },

    /**
     * Get the proportion of isotopes currently within the chamber that match the specified configuration.
     *
     * @param {NumberAtom} isotopeConfig
     * @return {number} isotopeProportion
     *
     * @public
     */
    getIsotopeProportion: function( isotopeConfig ) {
      // Calculates charge to ensure that isotopes are neutral.
      assert && assert( isotopeConfig.protonCount - isotopeConfig.electronCount === 0 );
      var isotopeCount = 0;

      this.containedIsotopes.forEach( function( isotope ) {
        if ( isotopeConfig.equals( isotope.atomConfiguration ) ) {
          isotopeCount++;
        }
      } );

      return isotopeCount / this.containedIsotopes.length;
    },


    /**
     * Move all the particles in the chamber such that they don't overlap. This is intended for usage where there are not
     * a lot of particles in the chamber. Using it in cases where there are a lost of particles could take a very long time.
     *
     * @public
     */
    adjustForOverlap: function() {
      // Bounds checking.  The threshold is pretty much arbitrary.
      assert && assert(this.getTotalIsotopeCount() <= 100,
        'Ignoring request to adjust for overlap - too many particles in the chamber for that');

      // Check for overlap and adjust particle positions until none exists.
      var maxIterations = 10000; // Empirically determined
      for ( var i = 0; this.checkForParticleOverlap() && i < maxIterations; i++ ) {
        // Adjustment factors for the repositioning algorithm, these can be adjusted for different behaviour.
        var interParticleForceConst = 200;
        var wallForceConst = interParticleForceConst * 10;
        var minInterParticleDistance = 5;
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
              // These isotopes are sitting right on top of one another.
              // Add the max amount of inter-particle force in a random direction.
              forceFromIsotope.setPolar( interParticleForceConst / ( minInterParticleDistance * minInterParticleDistance ),
                this.random.random() * 2 * Math.PI );
            }
            else if ( distanceBetweenIsotopes < isotope1.radius + isotope2.radius ) {
              // calculate the repulsive force based on the distance.
              forceFromIsotope.x = isotope1.position.x - isotope2.position.x;
              forceFromIsotope.y = isotope1.position.y - isotope2.position.y;
              var distance = Math.max( forceFromIsotope.magnitude(), minInterParticleDistance );
              forceFromIsotope.normalize();
              forceFromIsotope.multiply( interParticleForceConst / ( distance * distance ) );
            }
            totalForce.add( forceFromIsotope );
          }

          // Calculate the force due to the walls. This prevents particles from being pushed out of the bounds of the chamber.
          if ( isotope1.position.x + isotope1.radius >= TEST_CHAMBER_RECT.maxX ) {
            var distanceFromRightWall = TEST_CHAMBER_RECT.maxX - isotope1.position.x;
            totalForce.add( new Vector2( -wallForceConst / ( distanceFromRightWall * distanceFromRightWall ), 0 ) );
          }
          else if ( isotope1.position.x - isotope1.radius <= TEST_CHAMBER_RECT.minX ) {
            var distanceFromLeftWall = isotope1.position.x - TEST_CHAMBER_RECT.minX;
            totalForce.add( new Vector2( wallForceConst / ( distanceFromLeftWall * distanceFromLeftWall ), 0 ) );
          }
          if ( isotope1.position.y + isotope1.radius >= TEST_CHAMBER_RECT.maxY ) {
            var distanceFromTopWall = TEST_CHAMBER_RECT.maxY - isotope1.position.y;
            totalForce.add( new Vector2( 0, -wallForceConst / ( distanceFromTopWall * distanceFromTopWall ) ) );
          }
          else if ( isotope1.position.y - isotope1.radius <= TEST_CHAMBER_RECT.minY ) {
            var distanceFromBottomWall = isotope1.position.y - TEST_CHAMBER_RECT.minY;
            totalForce.add( new Vector2( 0, wallForceConst / ( distanceFromBottomWall * distanceFromBottomWall ) ) );
          }
          // Put the calculated repulsive force into the map.
          mapIsotopesToForces[ isotope1.instanceCount ] = totalForce;
          mapIsotopesIDToIsotope[ isotope1.instanceCount ] = isotope1;
        } );

        // Adjust the particle positions based on forces.
        for ( var isotopeID in mapIsotopesToForces ) {
          if ( mapIsotopesToForces.hasOwnProperty( isotopeID ) ) {
            // Sets the position of the isotope to the corresponding Vector2 from mapIsotopesToForces
            mapIsotopesIDToIsotope[ isotopeID ]
              .setPositionAndDestination( mapIsotopesToForces[ isotopeID ].add( mapIsotopesIDToIsotope[ isotopeID ].position ) );
          }

        }
      }
    },

    /**
     * Checks to ensure that particles are not overlapped.
     *
     * @returns {boolean}
     *
     * //@private
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
            overlapCheck = true;
            return overlapCheck;
          }
        }
      } );

      return overlapCheck;
    },


    /**
     * Generate a random location within the test chamber.
     *
     * @return {Vector2}
     *
     * @public
     */
    generateRandomLocation: function() {
      return new Vector2(
        TEST_CHAMBER_RECT.minX + this.random.random() * TEST_CHAMBER_RECT.width,
        TEST_CHAMBER_RECT.minY + this.random.random() * TEST_CHAMBER_RECT.height );
    },

    // @public
    getState: function() {
      return new State( this );
    },


    /**
     * Restore a previously captured state
     * @param {State} state
     *
     * @public
     */
    setState: function( state ) {
      this.removeAllIsotopes( true );
      this.bulkAddIsotopesToChamber( state.containedIsotopes );
    }
  } );
} );
