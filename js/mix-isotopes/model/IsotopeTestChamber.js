// Copyright 2015-2017, University of Colorado Boulder

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
  var Property = require( 'AXON/Property' );
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
    } );
  }

  /**
   * @constructor
   * @param {MixIsotopesModel} model
   *
   */
  function IsotopeTestChamber( model ) {

    // @private - Isotope Mixtures Model that contains this test chamber.
    this.model = model;

    // {ObservableArray<MovableAtom>} Observable array that keeps track of the isotopes in the chamber and is updated as
    // isotopes come and go.
    // @public
    this.containedIsotopes = new ObservableArray();

    // @public {Read-Only}
    this.isotopeCountProperty = new Property( 0 );
    this.averageAtomicMassProperty = new Property( 0 );
  }

  isotopesAndAtomicMass.register( 'IsotopeTestChamber', IsotopeTestChamber );
  return inherit( Object, IsotopeTestChamber, {
    /**
     * Get the number of isotopes currently in the chamber that match the specified configuration.
     *
     * @param {NumberAtom} isotopeConfig
     * @returns {number} isotopeCount
     * @public
     */
    getIsotopeCount: function( isotopeConfig ) {
      assert && assert( isotopeConfig.protonCountProperty.get() === isotopeConfig.electronCountProperty.get() ); // Should always be neutral atom.
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
     * @returns {boolean}
     * @public
     */
    isIsotopePositionedOverChamber: function( isotope ) {
      return TEST_CHAMBER_RECT.containsPoint( isotope.positionProperty.get() );
    },

    /**
     * Add the specified isotope to the chamber. This method requires that the position of the isotope be within the
     * chamber rectangle, or the isotope will not be added.
     *
     * In cases where an isotope is in a position where the center is within the chamber but the edges are not, the
     * isotope will be moved so that it is fully contained within the chamber.
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
        var protrusion = isotope.positionProperty.get().x + isotope.radiusProperty.get() - TEST_CHAMBER_RECT.maxX + BUFFER;
        if ( protrusion >= 0 ) {
          isotope.setPositionAndDestination( new Vector2( isotope.positionProperty.get().x - protrusion,
            isotope.positionProperty.get().y ) );
        } else {
          protrusion = TEST_CHAMBER_RECT.minX + BUFFER - ( isotope.positionProperty.get().x - isotope.radiusProperty.get() );
          if ( protrusion >= 0 ) {
            isotope.setPositionAndDestination( new Vector2( isotope.positionProperty.get().x + protrusion,
              isotope.positionProperty.get().y ) );
          }
        }
        protrusion = isotope.positionProperty.get().y + isotope.radiusProperty.get() - TEST_CHAMBER_RECT.maxY + BUFFER;
        if ( protrusion >= 0 ) {
          isotope.setPositionAndDestination( new Vector2( isotope.positionProperty.get().x,
            isotope.positionProperty.get().y - protrusion ) );
        } else {
          protrusion = TEST_CHAMBER_RECT.minY + BUFFER - ( isotope.positionProperty.get().y - isotope.radiusProperty.get() );
          if ( protrusion >= 0 ) {
            isotope.setPositionAndDestination( new Vector2( isotope.positionProperty.get().x,
              isotope.positionProperty.get().y + protrusion ) );
          }
        }
        if ( performUpdates ) {
          // Update the isotope count.
          this.updateCountProperty();
          // Update the average atomic mass.
          this.averageAtomicMassProperty.set( ( ( this.averageAtomicMassProperty.get() *
                                                  ( this.isotopeCountProperty.get() - 1 ) ) +
            isotope.atomConfiguration.getIsotopeAtomicMass() ) / this.isotopeCountProperty.get() );
        }
      } else {
        // This isotope is not positioned correctly.
        assert && assert( false, 'Ignoring attempt to add incorrectly located isotope to test chamber.' );
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
      this.isotopeCountProperty.set( this.containedIsotopes.length );
    },

    // @private
    updateAverageAtomicMassProperty: function() {
      if ( this.containedIsotopes.length > 0 ) {
        var totalMass = 0;
        this.containedIsotopes.forEach( function( isotope ) {
          totalMass += isotope.atomConfiguration.getIsotopeAtomicMass();
        } );

        this.averageAtomicMassProperty.set( totalMass / this.containedIsotopes.length );
      } else {
        this.averageAtomicMassProperty.set( 0 );
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
      if ( this.isotopeCountProperty.get() > 0 ) {
        this.averageAtomicMassProperty.set( ( this.averageAtomicMassProperty.get() * ( this.isotopeCountProperty.get() + 1 ) -
          isotope.atomConfiguration.getIsotopeAtomicMass() ) / this.isotopeCountProperty.get() );
      } else {
        this.averageAtomicMassProperty.set( 0 );
      }
    },


    /**
     * Remove an isotope from the chamber that matches the specified atom configuration. Note that electrons are ignored.
     *
     * @param {NumberAtom} isotopeConfig
     * @returns {MovableAtom} removedIsotope
     *
     * @public
     */
    removeIsotopeMatchingConfig: function( isotopeConfig ) {
      assert && assert( ( isotopeConfig.protonCountProperty.get() - isotopeConfig.electronCountProperty.get() ) === 0 );

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
    removeAllIsotopes: function() {
      this.containedIsotopes.clear();
      this.updateCountProperty();
      this.averageAtomicMassProperty.set( 0 );
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
     * @returns {number}
     * @public
     */
    getTotalIsotopeCount: function() {
      return this.isotopeCountProperty.get();
    },

    /**
     * Get the proportion of isotopes currently within the chamber that match the specified configuration.
     *
     * @param {NumberAtom} isotopeConfig
     * @returns {number} isotopeProportion
     *
     * @public
     */
    getIsotopeProportion: function( isotopeConfig ) {
      // Calculates charge to ensure that isotopes are neutral.
      assert && assert( isotopeConfig.protonCountProperty.get() - isotopeConfig.electronCountProperty.get() === 0 );
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
      assert && assert( this.getTotalIsotopeCount() <= 100,
        'Ignoring request to adjust for overlap - too many particles in the chamber for that' );

      // Check for overlap and adjust particle positions until none exists.
      var maxIterations = 10000; // Empirically determined
      for ( var i = 0; this.checkForParticleOverlap() && i < maxIterations; i++ ) {
        // Adjustment factors for the repositioning algorithm, these can be adjusted for different behaviour.
        var interParticleForceConst = 200;
        var wallForceConst = interParticleForceConst * 10;
        var minInterParticleDistance = 5;
        var mapIsotopesToForces = {};
        var mapIsotopesIDToIsotope = {};

        var self = this; //Prevents any scope error when using this.

        this.containedIsotopes.forEach( function( isotope1 ) {

          var totalForce = new Vector2( 0, 0 );
          //Calculate the force due to other isotopes
          for ( var j = 0; j < self.containedIsotopes.length; j++ ) {
            var isotope2 = self.containedIsotopes.get( j );
            if ( isotope1 === isotope2 ) {
              continue;

            }
            var forceFromIsotope = new Vector2( 0, 0 );
            var distanceBetweenIsotopes = isotope1.positionProperty.get().distance( isotope2.positionProperty.get() );
            if ( distanceBetweenIsotopes === 0 ) {
              // These isotopes are sitting right on top of one another.
              // Add the max amount of inter-particle force in a random direction.
              forceFromIsotope.setPolar( interParticleForceConst / ( minInterParticleDistance * minInterParticleDistance ),
                phet.joist.random.nextDouble() * 2 * Math.PI );
            } else if ( distanceBetweenIsotopes < isotope1.radiusProperty.get() + isotope2.radiusProperty.get() ) {
              // calculate the repulsive force based on the distance.
              forceFromIsotope.x = isotope1.positionProperty.get().x - isotope2.positionProperty.get().x;
              forceFromIsotope.y = isotope1.positionProperty.get().y - isotope2.positionProperty.get().y;
              var distance = Math.max( forceFromIsotope.magnitude, minInterParticleDistance );
              forceFromIsotope.normalize();
              forceFromIsotope.multiply( interParticleForceConst / ( distance * distance ) );
            }
            totalForce.add( forceFromIsotope );
          }

          // Calculate the force due to the walls. This prevents particles from being pushed out of the bounds of the chamber.
          if ( isotope1.positionProperty.get().x + isotope1.radiusProperty.get() >= TEST_CHAMBER_RECT.maxX ) {
            var distanceFromRightWall = TEST_CHAMBER_RECT.maxX - isotope1.positionProperty.get().x;
            totalForce.add( new Vector2( -wallForceConst / ( distanceFromRightWall * distanceFromRightWall ), 0 ) );
          } else if ( isotope1.positionProperty.get().x - isotope1.radius <= TEST_CHAMBER_RECT.minX ) {
            var distanceFromLeftWall = isotope1.positionProperty.get().x - TEST_CHAMBER_RECT.minX;
            totalForce.add( new Vector2( wallForceConst / ( distanceFromLeftWall * distanceFromLeftWall ), 0 ) );
          }
          if ( isotope1.positionProperty.get().y + isotope1.radiusProperty.get() >= TEST_CHAMBER_RECT.maxY ) {
            var distanceFromTopWall = TEST_CHAMBER_RECT.maxY - isotope1.positionProperty.get().y;
            totalForce.add( new Vector2( 0, -wallForceConst / ( distanceFromTopWall * distanceFromTopWall ) ) );
          } else if ( isotope1.positionProperty.get().y - isotope1.radiusProperty.get() <= TEST_CHAMBER_RECT.minY ) {
            var distanceFromBottomWall = isotope1.positionProperty.get().y - TEST_CHAMBER_RECT.minY;
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
              .setPositionAndDestination( mapIsotopesToForces[ isotopeID ].add( mapIsotopesIDToIsotope[ isotopeID ].positionProperty.get() ) );
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
      var self = this;
      var overlapCheck = false;

      self.containedIsotopes.forEach( function( isotope1 ) {
        for ( var i = 0; i < self.containedIsotopes.length; i++ ) {
          var isotope2 = self.containedIsotopes.get( i );
          if ( isotope1 === isotope2 ) {
            // Same isotope so skip it!
            continue;
          }

          var distance = isotope1.positionProperty.get().distance( isotope2.positionProperty.get() );
          if ( distance < isotope1.radiusProperty.get() + isotope2.radiusProperty.get() ) {
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
     * @returns {Vector2}
     *
     * @public
     */
    generateRandomLocation: function() {
      return new Vector2(
        TEST_CHAMBER_RECT.minX + phet.joist.random.nextDouble() * TEST_CHAMBER_RECT.width,
        TEST_CHAMBER_RECT.minY + phet.joist.random.nextDouble() * TEST_CHAMBER_RECT.height );
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

