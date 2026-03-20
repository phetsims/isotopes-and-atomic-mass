// Copyright 2015-2026, University of Colorado Boulder

/**
 * Class that represents a "test chamber" where multiple isotopes can be placed. The test chamber calculates the
 * average atomic mass and the proportions of the various isotopes. It is intended to be contained in the
 * main model class.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author James Smith
 * @author Aadish Gupta
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import AtomConfig from '../../../../shred/js/model/AtomConfig.js';
import PositionableAtom from './PositionableAtom.js';

// constants

// Size of the "test chamber", which is the area in model space into which the isotopes can be dragged in order to
// contribute to the current average atomic weight. In picometers.
const SIZE = new Dimension2( 450, 280 );
const TEST_CHAMBER_RECT = new Rectangle( -SIZE.width / 2, -SIZE.height / 2, SIZE.width, SIZE.height );
const BUFFER = 1; // isotopes stroke doesn't cross the wall, empirically determined

class IsotopeTestChamber {

  public readonly containedIsotopes: ObservableArray<PositionableAtom>;
  public readonly averageAtomicMassProperty: Property<number>;

  public constructor() {
    this.containedIsotopes = createObservableArray<PositionableAtom>();
    this.averageAtomicMassProperty = new Property<number>( 0 );

    this.containedIsotopes.lengthProperty.link( () => {
      if ( this.containedIsotopes.length > 0 ) {
        let totalMass = 0;
        this.containedIsotopes.forEach( isotope => {
          totalMass += isotope.atomConfigurationProperty.value.getAtomicMass();
        } );
        this.averageAtomicMassProperty.set( totalMass / this.containedIsotopes.length );
      }
      else {
        this.averageAtomicMassProperty.set( 0 );
      }
    } );
  }

  /**
   * Get the number of isotopes currently in the chamber that match the specified configuration.
   */
  public getIsotopeCount( isotopeConfig: AtomConfig ): number {
    let isotopeCount = 0;
    this.containedIsotopes.forEach( isotope => {
      if ( isotope.atomConfigurationProperty.value.equals( isotopeConfig ) ) {
        isotopeCount++;
      }
    } );
    return isotopeCount;
  }

  /**
   * Get the rectangle shape that represents the test chamber.
   */
  public getTestChamberRect(): Rectangle {
    return TEST_CHAMBER_RECT;
  }

  /**
   * Test whether an isotope is positioned within the bounds of the chamber.
   */
  public isIsotopePositionedOverChamber( isotope: PositionableAtom ): boolean {
    return TEST_CHAMBER_RECT.containsPoint( isotope.positionProperty.get() );
  }

  /**
   * Add the specified atom to the test chamber.
   */
  public addParticle( atom: PositionableAtom ): void {

    affirm(
      this.isIsotopePositionedOverChamber( atom ),
      'Isotope is not positioned correctly for being added to the test chamber.'
    );

    this.containedIsotopes.push( atom );
    atom.containerProperty.value = this;

    // If the edges of the atom are outside the container, move it to be fully inside.
    let protrusion = atom.positionProperty.get().x + atom.radius - TEST_CHAMBER_RECT.maxX + BUFFER;
    if ( protrusion >= 0 ) {
      atom.setPositionAndDestination( new Vector2( atom.positionProperty.get().x - protrusion,
        atom.positionProperty.get().y ) );
    }
    else {
      protrusion = TEST_CHAMBER_RECT.minX + BUFFER - ( atom.positionProperty.get().x - atom.radius );
      if ( protrusion >= 0 ) {
        atom.setPositionAndDestination( new Vector2( atom.positionProperty.get().x + protrusion,
          atom.positionProperty.get().y ) );
      }
    }
    protrusion = atom.positionProperty.get().y + atom.radius - TEST_CHAMBER_RECT.maxY + BUFFER;
    if ( protrusion >= 0 ) {
      atom.setPositionAndDestination( new Vector2( atom.positionProperty.get().x,
        atom.positionProperty.get().y - protrusion ) );
    }
    else {
      protrusion = TEST_CHAMBER_RECT.minY + BUFFER - ( atom.positionProperty.get().y - atom.radius );
      if ( protrusion >= 0 ) {
        atom.setPositionAndDestination( new Vector2( atom.positionProperty.get().x,
          atom.positionProperty.get().y + protrusion ) );
      }
    }
  }

  /**
   * Adds a list of isotopes to the test chamber.
   */
  public bulkAddIsotopesToChamber( isotopeList: PositionableAtom[] ): void {
    isotopeList.forEach( isotope => {
      this.addParticle( isotope );
    } );
  }

  /**
   * Remove a particle from the chamber.
   */
  public removeParticle( isotope: PositionableAtom ): void {
    this.containedIsotopes.remove( isotope );
    isotope.containerProperty.value = null;
  }

  /**
   * Checks if the isotope is contained in the chamber.
   */
  public includes( isotope: PositionableAtom ): boolean {
    return this.containedIsotopes.includes( isotope );
  }

  /**
   * Remove an isotope from the chamber that matches the specified atom configuration. Note that electrons are ignored.
   */
  public removeIsotopeMatchingConfig( isotopeConfig: AtomConfig ): PositionableAtom | null {
    let removedIsotope: PositionableAtom | null = null;
    this.containedIsotopes.forEach( isotope => {
      if ( isotope.atomConfigurationProperty.value.equals( isotopeConfig ) ) {
        removedIsotope = isotope;
      }
    } );
    if ( removedIsotope ) {
      this.removeParticle( removedIsotope );
    }
    return removedIsotope;
  }

  /**
   * Removes all isotopes
   */
  public removeAllIsotopes(): void {
    this.containedIsotopes.clear();
  }

  /**
   * Get a count of the total number of isotopes in the chamber.
   */
  public getTotalIsotopeCount(): number {
    return this.containedIsotopes.length;
  }

  /**
   * Get the proportion of isotopes currently within the chamber that match the specified configuration.
   */
  public getIsotopeProportion( isotopeConfig: AtomConfig ): number {
    let isotopeCount = 0;
    this.containedIsotopes.forEach( isotope => {
      if ( isotope.atomConfigurationProperty.value.equals( isotopeConfig ) ) {
        isotopeCount++;
      }
    } );
    return this.containedIsotopes.length > 0 ? isotopeCount / this.containedIsotopes.length : 0;
  }

  /**
   * Move all the particles in the chamber such that they don't overlap and don't protrude outside the chamber.
   */
  public adjustForOverlap(): void {
    assert && assert(
      this.getTotalIsotopeCount() <= 100,
      'Too many particles in the chamber to adjust for overlap'
    );

    // Check for overlap and adjust particle positions until none exists.
    const maxIterations = 10000;
    for ( let i = 0; this.checkForParticleOverlap() && i < maxIterations; i++ ) {

      // Adjustment factors for the repositioning algorithm, these can be changed for different behaviour.
      const interParticleForceConst = 200;
      const wallForceConst = interParticleForceConst * 10;
      const minInterParticleDistance = 5;
      const mapIsotopesToForces = new Map<PositionableAtom, Vector2>();

      this.containedIsotopes.forEach( isotope1 => {

        const totalForce = new Vector2( 0, 0 );

        // Check this isotope against all others, and calculate the resulting forces on it.
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
          else if ( distanceBetweenIsotopes < isotope1.radius + isotope2.radius ) {

            // Calculate the repulsive force based on the distance.
            forceFromIsotope.x = isotope1.positionProperty.get().x - isotope2.positionProperty.get().x;
            forceFromIsotope.y = isotope1.positionProperty.get().y - isotope2.positionProperty.get().y;
            const distance = Math.max( forceFromIsotope.magnitude, minInterParticleDistance );
            forceFromIsotope.normalize();
            forceFromIsotope.multiply( interParticleForceConst / ( distance * distance ) );
          }
          totalForce.add( forceFromIsotope );
        }

        // Check the isotope against the walls of the chamber, and calculate the forces on it.
        if ( isotope1.positionProperty.get().x + isotope1.radius >= TEST_CHAMBER_RECT.maxX ) {
          const distanceFromRightWall = TEST_CHAMBER_RECT.maxX - isotope1.positionProperty.get().x;
          totalForce.add( new Vector2( -wallForceConst / ( distanceFromRightWall * distanceFromRightWall ), 0 ) );
        }
        else if ( isotope1.positionProperty.get().x - isotope1.radius <= TEST_CHAMBER_RECT.minX ) {
          const distanceFromLeftWall = isotope1.positionProperty.get().x - TEST_CHAMBER_RECT.minX;
          totalForce.add( new Vector2( wallForceConst / ( distanceFromLeftWall * distanceFromLeftWall ), 0 ) );
        }
        if ( isotope1.positionProperty.get().y + isotope1.radius >= TEST_CHAMBER_RECT.maxY ) {
          const distanceFromTopWall = TEST_CHAMBER_RECT.maxY - isotope1.positionProperty.get().y;
          totalForce.add( new Vector2( 0, -wallForceConst / ( distanceFromTopWall * distanceFromTopWall ) ) );
        }
        else if ( isotope1.positionProperty.get().y - isotope1.radius <= TEST_CHAMBER_RECT.minY ) {
          const distanceFromBottomWall = isotope1.positionProperty.get().y - TEST_CHAMBER_RECT.minY;
          totalForce.add( new Vector2( 0, wallForceConst / ( distanceFromBottomWall * distanceFromBottomWall ) ) );
        }

        // Put the calculated repulsive force into the map.
        mapIsotopesToForces.set( isotope1, totalForce );
      } );

      // Apply the forces to the isotopes.
      for ( const [ isotope, force ] of mapIsotopesToForces ) {
        isotope.setPositionAndDestination( isotope.positionProperty.value.plus( force ) );
      }
    }
  }

  /**
   * Checks to ensure that particles are not overlapped.
   */
  private checkForParticleOverlap(): boolean {
    let overlapExists = false;
    for ( let i = 0; i < this.containedIsotopes.length && !overlapExists; i++ ) {
      const isotope1 = this.containedIsotopes.get( i );
      for ( let j = 0; j < this.containedIsotopes.length && !overlapExists; j++ ) {
        const isotope2 = this.containedIsotopes.get( j );
        if ( isotope1 === isotope2 ) {

          // Don't compare an isotope against itself.
          continue;
        }
        const distance = isotope1.positionProperty.get().distance( isotope2.positionProperty.get() );
        if ( distance < isotope1.radius + isotope2.radius ) {
          overlapExists = true;
        }
      }
    }
    return overlapExists;
  }

  /**
   * Generate a random position within the test chamber.
   */
  public generateRandomPosition(): Vector2 {
    return new Vector2(
      TEST_CHAMBER_RECT.minX + dotRandom.nextDouble() * TEST_CHAMBER_RECT.width,
      TEST_CHAMBER_RECT.minY + dotRandom.nextDouble() * TEST_CHAMBER_RECT.height
    );
  }

  public getState(): IsotopeTestChamberState {
    return new IsotopeTestChamberState( this );
  }

  /**
   * Restore a previously captured state.
   */
  public setState( state: IsotopeTestChamberState ): void {
    this.removeAllIsotopes();
    this.bulkAddIsotopesToChamber( state.containedIsotopes );
  }
}


/**
 * Utility class that holds the state of the isotope test chamber, and can be used for saving and later restoring the
 * state.
 */
export class IsotopeTestChamberState {
  public containedIsotopes: ObservableArray<PositionableAtom>;

  public constructor( isotopeTestChamber: IsotopeTestChamber ) {
    this.containedIsotopes = createObservableArray<PositionableAtom>();
    isotopeTestChamber.containedIsotopes.forEach( ( isotope: PositionableAtom ) => {
      this.containedIsotopes.add( isotope );
    } );
  }
}

export default IsotopeTestChamber;
