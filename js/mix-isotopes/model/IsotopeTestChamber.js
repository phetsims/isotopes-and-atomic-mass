// Copyright 2015-2021, University of Colorado Boulder

/**
 * Class that represents a "test chamber" where multiple isotopes can be placed. The test chamber calculates the
 * average atomic mass and the proportions of the various isotopes. It is intended to be contained in the
 * main model class.
 *
 * @author John Blanco
 * @author James Smith
 * @author Aadish Gupta
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

// constants

// Size of the "test chamber", which is the area in model space into which the isotopes can be dragged in order to
// contribute to the current average atomic weight.
const SIZE = new Dimension2( 450, 280 ); // In picometers.

// Rectangle that defines the position of the test chamber. This is set up so that the center of the test chamber is
// at (0, 0) in model space.
const TEST_CHAMBER_RECT = new Rectangle( -SIZE.width / 2, -SIZE.height / 2, SIZE.width, SIZE.height );
const BUFFER = 1; // isotopes stroke doesn't cross the wall, empirically determined

/**
 * Utility Function that contains the state of the isotope test chamber, and can be used for saving and later restoring
 * the state.
 *
 * @param {IsotopeTestChamber} isotopeTestChamber
 */
function State( isotopeTestChamber ) {
  this.containedIsotopes = createObservableArray();
  isotopeTestChamber.containedIsotopes.forEach( isotope => {
    this.containedIsotopes.add( isotope );
  } );
}

class IsotopeTestChamber {

  /**
   * @param {MixIsotopesModel} model
   */
  constructor( model ) {

    // @private {MixIsotopesModel} - model that contains this test chamber
    this.model = model;

    // @public - {ObservableArrayDef.<MovableAtom>} - isotopes that are in this test chamber
    this.containedIsotopes = createObservableArray();

    // @public {Read-Only}
    this.isotopeCountProperty = new Property( 0 );
    this.averageAtomicMassProperty = new Property( 0 );
  }

  /**
   * Get the number of isotopes currently in the chamber that match the specified configuration.
   * @param {NumberAtom} isotopeConfig
   * @returns {number} isotopeCount
   * @public
   */
  getIsotopeCount( isotopeConfig ) {
    assert && assert( isotopeConfig.protonCountProperty.get() === isotopeConfig.electronCountProperty.get() ); // Should always be neutral atom.
    let isotopeCount = 0;
    this.containedIsotopes.forEach( isotope => {
      if ( isotope.atomConfiguration.equals( isotopeConfig ) ) {
        isotopeCount++;
      }
    } );
    return isotopeCount;
  }

  /**
   * @returns {Rectangle} TEST_CHAMBER_RECT
   * @public
   */
  getTestChamberRect() {
    return TEST_CHAMBER_RECT;
  }

  /**
   * Test whether an isotope is within the chamber. This is strictly a 2D test that looks as the isotopes center
   * position and determines if it is within the bounds of the chamber rectangle.
   * @param {MovableAtom} isotope
   * @returns {boolean}
   * @public
   */
  isIsotopePositionedOverChamber( isotope ) {
    return TEST_CHAMBER_RECT.containsPoint( isotope.positionProperty.get() );
  }

  /**
   * Add the specified isotope to the chamber. This method requires that the position of the isotope be within the
   * chamber rectangle, or the isotope will not be added.
   *
   * In cases where an isotope is in a position where the center is within the chamber but the edges are not, the
   * isotope will be moved so that it is fully contained within the chamber.
   *
   * @param {MovableAtom} isotope
   * @param {boolean} performUpdates - Flag that can be set be used to suppress updates.
   * @public
   */
  addIsotopeToChamber( isotope, performUpdates ) {
    if ( this.isIsotopePositionedOverChamber( isotope ) ) {
      this.containedIsotopes.push( isotope );

      const isotopeRemovedListener = userControlled => {
        if ( userControlled && this.containedIsotopes.includes( isotope ) ) {
          this.removeIsotopeFromChamber( isotope );
        }
        isotope.userControlledProperty.unlink( isotopeRemovedListener );
      };
      isotope.userControlledProperty.lazyLink( isotopeRemovedListener );

      // If the edges of the isotope are outside of the container, move it to be fully inside.
      let protrusion = isotope.positionProperty.get().x + isotope.radiusProperty.get() - TEST_CHAMBER_RECT.maxX + BUFFER;
      if ( protrusion >= 0 ) {
        isotope.setPositionAndDestination( new Vector2( isotope.positionProperty.get().x - protrusion,
          isotope.positionProperty.get().y ) );
      }
      else {
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
      }
      else {
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
    }
    else {
      // This isotope is not positioned correctly.
      assert && assert( false, 'Ignoring attempt to add incorrectly located isotope to test chamber.' );
    }
  }

  /**
   * Adds a list of isotopes to the test chamber. Same restrictions as above.
   * @param {MovableAtom[]} isotopeList
   * @public
   */
  bulkAddIsotopesToChamber( isotopeList ) {
    isotopeList.forEach( isotope => {
      this.addIsotopeToChamber( isotope, false );
    } );
    this.updateCountProperty();
    this.updateAverageAtomicMassProperty();
  }

  /**
   * Convenience function to set the isotopeCount property equal to the number of isotopes contained in this test chamber.
   * @private
   */
  updateCountProperty() {
    this.isotopeCountProperty.set( this.containedIsotopes.length );
  }

  // @private
  updateAverageAtomicMassProperty() {
    if ( this.containedIsotopes.length > 0 ) {
      let totalMass = 0;
      this.containedIsotopes.forEach( isotope => {
        totalMass += isotope.atomConfiguration.getIsotopeAtomicMass();
      } );

      this.averageAtomicMassProperty.set( totalMass / this.containedIsotopes.length );
    }
    else {
      this.averageAtomicMassProperty.set( 0 );
    }
  }

  /**
   * @param {MovableAtom} isotope
   * @public
   */
  removeIsotopeFromChamber( isotope ) {
    this.containedIsotopes.remove( isotope );
    this.updateCountProperty();

    // Update the average atomic mass.
    if ( this.isotopeCountProperty.get() > 0 ) {
      this.averageAtomicMassProperty.set( ( this.averageAtomicMassProperty.get() * ( this.isotopeCountProperty.get() + 1 ) -
                                            isotope.atomConfiguration.getIsotopeAtomicMass() ) / this.isotopeCountProperty.get() );
    }
    else {
      this.averageAtomicMassProperty.set( 0 );
    }
  }

  /**
   * Remove an isotope from the chamber that matches the specified atom configuration. Note that electrons are ignored.
   * @param {NumberAtom} isotopeConfig
   * @returns {MovableAtom} removedIsotope
   * @public
   */
  removeIsotopeMatchingConfig( isotopeConfig ) {
    assert && assert( ( isotopeConfig.protonCountProperty.get() - isotopeConfig.electronCountProperty.get() ) === 0 );

    // Locate and remove a matching isotope.
    let removedIsotope = null;
    this.containedIsotopes.forEach( isotope => {
      if ( isotope.atomConfiguration.equals( isotopeConfig ) ) {
        removedIsotope = isotope;
      }
    } );
    this.removeIsotopeFromChamber( removedIsotope );
    return removedIsotope;
  }

  /**
   * Removes all isotopes
   * @public
   */
  removeAllIsotopes() {
    this.containedIsotopes.clear();
    this.updateCountProperty();
    this.averageAtomicMassProperty.set( 0 );
  }

  /**
   * Returns the containedIsotopes.
   * @returns {ObservableArrayDef}
   * @public
   */
  getContainedIsotopes() {
    return this.containedIsotopes;
  }

  /**
   * Get a count of the total number of isotopes in the chamber.
   * @returns {number}
   * @public
   */
  getTotalIsotopeCount() {
    return this.isotopeCountProperty.get();
  }

  /**
   * Get the proportion of isotopes currently within the chamber that match the specified configuration.
   * @param {NumberAtom} isotopeConfig
   * @returns {number} isotopeProportion
   * @public
   */
  getIsotopeProportion( isotopeConfig ) {
    // Calculates charge to ensure that isotopes are neutral.
    assert && assert( isotopeConfig.protonCountProperty.get() - isotopeConfig.electronCountProperty.get() === 0 );
    let isotopeCount = 0;

    this.containedIsotopes.forEach( isotope => {
      if ( isotopeConfig.equals( isotope.atomConfiguration ) ) {
        isotopeCount++;
      }
    } );

    return isotopeCount / this.containedIsotopes.length;
  }

  /**
   * Move all the particles in the chamber such that they don't overlap. This is intended for usage where there are not
   * a lot of particles in the chamber. Using it in cases where there are a lost of particles could take a very long time.
   * @public
   */
  adjustForOverlap() {

    // Bounds checking.  The threshold is pretty much arbitrary.
    assert && assert(
      this.getTotalIsotopeCount() <= 100,
      'Ignoring request to adjust for overlap - too many particles in the chamber for that'
    );

    // Check for overlap and adjust particle positions until none exists.
    const maxIterations = 10000; // empirically determined
    for ( let i = 0; this.checkForParticleOverlap() && i < maxIterations; i++ ) {

      // Adjustment factors for the repositioning algorithm, these can be changed for different behaviour.
      const interParticleForceConst = 200;
      const wallForceConst = interParticleForceConst * 10;
      const minInterParticleDistance = 5;
      const mapIsotopesToForces = {};
      const mapIsotopesIDToIsotope = {};

      this.containedIsotopes.forEach( isotope1 => {

        const totalForce = new Vector2( 0, 0 );

        // Calculate the force due to other isotopes.
        for ( let j = 0; j < this.containedIsotopes.length; j++ ) {
          const isotope2 = this.containedIsotopes.get( j );
          if ( isotope1 === isotope2 ) {
            continue;

          }
          const forceFromIsotope = new Vector2( 0, 0 );
          const distanceBetweenIsotopes = isotope1.positionProperty.get().distance( isotope2.positionProperty.get() );
          if ( distanceBetweenIsotopes === 0 ) {

            // These isotopes are sitting right on top of one another.  Add the max amount of inter-particle force in a
            // random direction.
            forceFromIsotope.setPolar( interParticleForceConst / ( minInterParticleDistance * minInterParticleDistance ),
              dotRandom.nextDouble() * 2 * Math.PI );
          }
          else if ( distanceBetweenIsotopes < isotope1.radiusProperty.get() + isotope2.radiusProperty.get() ) {
            // calculate the repulsive force based on the distance.
            forceFromIsotope.x = isotope1.positionProperty.get().x - isotope2.positionProperty.get().x;
            forceFromIsotope.y = isotope1.positionProperty.get().y - isotope2.positionProperty.get().y;
            const distance = Math.max( forceFromIsotope.magnitude, minInterParticleDistance );
            forceFromIsotope.normalize();
            forceFromIsotope.multiply( interParticleForceConst / ( distance * distance ) );
          }
          totalForce.add( forceFromIsotope );
        }

        // Calculate the force due to the walls. This prevents particles from being pushed out of the bounds of the chamber.
        if ( isotope1.positionProperty.get().x + isotope1.radiusProperty.get() >= TEST_CHAMBER_RECT.maxX ) {
          const distanceFromRightWall = TEST_CHAMBER_RECT.maxX - isotope1.positionProperty.get().x;
          totalForce.add( new Vector2( -wallForceConst / ( distanceFromRightWall * distanceFromRightWall ), 0 ) );
        }
        else if ( isotope1.positionProperty.get().x - isotope1.radius <= TEST_CHAMBER_RECT.minX ) {
          const distanceFromLeftWall = isotope1.positionProperty.get().x - TEST_CHAMBER_RECT.minX;
          totalForce.add( new Vector2( wallForceConst / ( distanceFromLeftWall * distanceFromLeftWall ), 0 ) );
        }
        if ( isotope1.positionProperty.get().y + isotope1.radiusProperty.get() >= TEST_CHAMBER_RECT.maxY ) {
          const distanceFromTopWall = TEST_CHAMBER_RECT.maxY - isotope1.positionProperty.get().y;
          totalForce.add( new Vector2( 0, -wallForceConst / ( distanceFromTopWall * distanceFromTopWall ) ) );
        }
        else if ( isotope1.positionProperty.get().y - isotope1.radiusProperty.get() <= TEST_CHAMBER_RECT.minY ) {
          const distanceFromBottomWall = isotope1.positionProperty.get().y - TEST_CHAMBER_RECT.minY;
          totalForce.add( new Vector2( 0, wallForceConst / ( distanceFromBottomWall * distanceFromBottomWall ) ) );
        }
        // Put the calculated repulsive force into the map.
        mapIsotopesToForces[ isotope1.instanceCount ] = totalForce;
        mapIsotopesIDToIsotope[ isotope1.instanceCount ] = isotope1;
      } );

      // Adjust the particle positions based on forces.
      for ( const isotopeID in mapIsotopesToForces ) {
        if ( mapIsotopesToForces.hasOwnProperty( isotopeID ) ) {
          // Sets the position of the isotope to the corresponding Vector2 from mapIsotopesToForces
          mapIsotopesIDToIsotope[ isotopeID ]
            .setPositionAndDestination( mapIsotopesToForces[ isotopeID ].add( mapIsotopesIDToIsotope[ isotopeID ].positionProperty.get() ) );
        }

      }
    }
  }

  /**
   * Checks to ensure that particles are not overlapped.
   * @returns {boolean}
   * @private
   */
  checkForParticleOverlap() {
    let overlapExists = false;

    for ( let i = 0; i < this.containedIsotopes.length && !overlapExists; i++ ) {
      const isotope1 = this.containedIsotopes.get( i );
      for ( let j = 0; j < this.containedIsotopes.length && !overlapExists; j++ ) {
        const isotope2 = this.containedIsotopes.get( j );
        if ( isotope1 === isotope2 ) {

          // Same isotope, so skip it.
          continue;
        }

        const distance = isotope1.positionProperty.get().distance( isotope2.positionProperty.get() );
        if ( distance < isotope1.radiusProperty.get() + isotope2.radiusProperty.get() ) {
          overlapExists = true;
        }
      }
    }

    return overlapExists;
  }

  /**
   * Generate a random position within the test chamber.
   * @returns {Vector2}
   * @public
   */
  generateRandomPosition() {
    return new Vector2(
      TEST_CHAMBER_RECT.minX + dotRandom.nextDouble() * TEST_CHAMBER_RECT.width,
      TEST_CHAMBER_RECT.minY + dotRandom.nextDouble() * TEST_CHAMBER_RECT.height );
  }

  // @public
  getState() {
    return new State( this );
  }

  /**
   * Restore a previously captured state.
   * @param {State} state
   * @public
   */
  setState( state ) {
    this.removeAllIsotopes( true );
    this.bulkAddIsotopesToChamber( state.containedIsotopes );
  }
}

isotopesAndAtomicMass.register( 'IsotopeTestChamber', IsotopeTestChamber );
export default IsotopeTestChamber;
