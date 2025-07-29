// Copyright 2015-2025, University of Colorado Boulder

/**
 * Class that represents a "test chamber" where multiple isotopes can be placed. The test chamber calculates the
 * average atomic mass and the proportions of the various isotopes. It is intended to be contained in the
 * main model class.
 *
 * @author John Blanco
 * @author James Smith
 * @author Aadish Gupta
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { TReadOnlyNumberAtom } from '../../../../shred/js/model/NumberAtom.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import MovableAtom from './MovableAtom.js';
import MixIsotopesModel from './MixIsotopesModel.js';

// constants

const SIZE = new Dimension2( 450, 280 ); // In picometers.
const TEST_CHAMBER_RECT = new Rectangle( -SIZE.width / 2, -SIZE.height / 2, SIZE.width, SIZE.height );
const BUFFER = 1; // isotopes stroke doesn't cross the wall, empirically determined

/**
 * Utility class that holds the state of the isotope test chamber, and can be used for saving and later restoring the
 * state.
 */
export class IsotopeTestChamberState {
  public containedIsotopes: ObservableArray<MovableAtom>;

  public constructor( isotopeTestChamber: IsotopeTestChamber ) {
    this.containedIsotopes = createObservableArray<MovableAtom>();
    isotopeTestChamber.containedIsotopes.forEach( ( isotope: MovableAtom ) => {
      this.containedIsotopes.add( isotope );
    } );
  }
}

class IsotopeTestChamber {

  private readonly model: MixIsotopesModel;
  public readonly containedIsotopes: ObservableArray<MovableAtom>;
  public readonly isotopeCountProperty: Property<number>;
  public readonly averageAtomicMassProperty: Property<number>;

  public constructor( model: MixIsotopesModel ) {
    this.model = model;
    this.containedIsotopes = createObservableArray<MovableAtom>();
    this.isotopeCountProperty = new Property<number>( 0 );
    this.averageAtomicMassProperty = new Property<number>( 0 );
  }

  /**
   * Get the number of isotopes currently in the chamber that match the specified configuration.
   */
  public getIsotopeCount( isotopeConfig: TReadOnlyNumberAtom ): number {
    assert && assert( isotopeConfig.protonCountProperty.get() === isotopeConfig.electronCountProperty.get() );
    let isotopeCount = 0;
    this.containedIsotopes.forEach( isotope => {
      if ( isotope.atomConfiguration.equals( isotopeConfig ) ) {
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
   * Test whether an isotope is within the chamber.
   */
  public isIsotopePositionedOverChamber( isotope: MovableAtom ): boolean {
    return TEST_CHAMBER_RECT.containsPoint( isotope.positionProperty.get() );
  }

  /**
   * Add the specified isotope to the test chamber.
   */
  public addParticle( isotope: MovableAtom, performUpdates: boolean ): void {
    if ( this.isIsotopePositionedOverChamber( isotope ) ) {
      this.containedIsotopes.push( isotope );
      isotope.containerProperty.value = this;

      // If the edges of the isotope are outside of the container, move it to be fully inside.
      let protrusion = isotope.positionProperty.get().x + isotope.radius - TEST_CHAMBER_RECT.maxX + BUFFER;
      if ( protrusion >= 0 ) {
        isotope.setPositionAndDestination( new Vector2( isotope.positionProperty.get().x - protrusion,
          isotope.positionProperty.get().y ) );
      }
      else {
        protrusion = TEST_CHAMBER_RECT.minX + BUFFER - ( isotope.positionProperty.get().x - isotope.radius );
        if ( protrusion >= 0 ) {
          isotope.setPositionAndDestination( new Vector2( isotope.positionProperty.get().x + protrusion,
            isotope.positionProperty.get().y ) );
        }
      }
      protrusion = isotope.positionProperty.get().y + isotope.radius - TEST_CHAMBER_RECT.maxY + BUFFER;
      if ( protrusion >= 0 ) {
        isotope.setPositionAndDestination( new Vector2( isotope.positionProperty.get().x,
          isotope.positionProperty.get().y - protrusion ) );
      }
      else {
        protrusion = TEST_CHAMBER_RECT.minY + BUFFER - ( isotope.positionProperty.get().y - isotope.radius );
        if ( protrusion >= 0 ) {
          isotope.setPositionAndDestination( new Vector2( isotope.positionProperty.get().x,
            isotope.positionProperty.get().y + protrusion ) );
        }
      }
      if ( performUpdates ) {
        this.updateCountProperty();
        this.averageAtomicMassProperty.set(
          ( ( this.averageAtomicMassProperty.get() * ( this.isotopeCountProperty.get() - 1 ) ) +
            isotope.atomConfiguration.getIsotopeAtomicMass() ) / this.isotopeCountProperty.get()
        );
      }
    }
    else {
      assert && assert( false, 'Ignoring attempt to add incorrectly located isotope to test chamber.' );
    }
  }

  /**
   * Adds a list of isotopes to the test chamber.
   */
  public bulkAddIsotopesToChamber( isotopeList: MovableAtom[] ): void {
    isotopeList.forEach( isotope => {
      this.addParticle( isotope, false );
    } );
    this.updateCountProperty();
    this.updateAverageAtomicMassProperty();
  }

  /**
   * Convenience function to set the isotopeCount property equal to the number of isotopes contained in this test chamber.
   */
  private updateCountProperty(): void {
    this.isotopeCountProperty.set( this.containedIsotopes.length );
  }

  private updateAverageAtomicMassProperty(): void {
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
   * Remove a particle from the chamber.
   */
  public removeParticle( isotope: MovableAtom ): void {
    this.containedIsotopes.remove( isotope );
    this.updateCountProperty();
    isotope.containerProperty.value = null;

    if ( this.isotopeCountProperty.get() > 0 ) {
      this.averageAtomicMassProperty.set(
        ( this.averageAtomicMassProperty.get() * ( this.isotopeCountProperty.get() + 1 ) -
          isotope.atomConfiguration.getIsotopeAtomicMass() ) / this.isotopeCountProperty.get()
      );
    }
    else {
      this.averageAtomicMassProperty.set( 0 );
    }
  }

  /**
   * Checks if the isotope is contained in the chamber.
   */
  public includes( isotope: MovableAtom ): boolean {
    return this.containedIsotopes.includes( isotope );
  }

  /**
   * Remove an isotope from the chamber that matches the specified atom configuration. Note that electrons are ignored.
   */
  public removeIsotopeMatchingConfig( isotopeConfig: TReadOnlyNumberAtom ): MovableAtom | null {
    assert && assert( ( isotopeConfig.protonCountProperty.get() - isotopeConfig.electronCountProperty.get() ) === 0 );
    let removedIsotope: MovableAtom | null = null;
    this.containedIsotopes.forEach( isotope => {
      if ( isotope.atomConfiguration.equals( isotopeConfig ) ) {
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
    this.updateCountProperty();
    this.averageAtomicMassProperty.set( 0 );
  }

  /**
   * Returns the containedIsotopes.
   */
  public getContainedIsotopes(): ObservableArray<MovableAtom> {
    return this.containedIsotopes;
  }

  /**
   * Get a count of the total number of isotopes in the chamber.
   */
  public getTotalIsotopeCount(): number {
    return this.isotopeCountProperty.get();
  }

  /**
   * Get the proportion of isotopes currently within the chamber that match the specified configuration.
   */
  public getIsotopeProportion( isotopeConfig: TReadOnlyNumberAtom ): number {
    assert && assert( isotopeConfig.protonCountProperty.get() - isotopeConfig.electronCountProperty.get() === 0 );
    let isotopeCount = 0;
    this.containedIsotopes.forEach( isotope => {
      if ( isotope.atomConfiguration.equals( isotopeConfig ) ) {
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
      'Ignoring request to adjust for overlap - too many particles in the chamber for that'
    );

    const maxIterations = 10000;
    for ( let i = 0; this.checkForParticleOverlap() && i < maxIterations; i++ ) {
      const interParticleForceConst = 200;
      const wallForceConst = interParticleForceConst * 10;
      const minInterParticleDistance = 5;
      const mapIsotopesToForces = new Map<MovableAtom, Vector2>();

      this.containedIsotopes.forEach( isotope1 => {

        const totalForce = new Vector2( 0, 0 );

        // Check this isotope against all others, and calculate the forces on it.
        for ( let j = 0; j < this.containedIsotopes.length; j++ ) {
          const isotope2 = this.containedIsotopes.get( j );
          if ( isotope1 === isotope2 ) {
            continue;
          }
          const forceFromIsotope = new Vector2( 0, 0 );
          const distanceBetweenIsotopes = isotope1.positionProperty.get().distance( isotope2.positionProperty.get() );
          if ( distanceBetweenIsotopes === 0 ) {
            forceFromIsotope.setPolar( interParticleForceConst / ( minInterParticleDistance * minInterParticleDistance ),
              dotRandom.nextDouble() * 2 * Math.PI );
          }
          else if ( distanceBetweenIsotopes < isotope1.radius + isotope2.radius ) {
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
        mapIsotopesToForces.set( isotope1, totalForce );
      } );

      // Apply the forces to the isotopes.
      for ( const [ isotope, force ] of mapIsotopesToForces ) {
        isotope.setPositionAndDestination( isotope.positionProperty.value.add( force ) );
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

isotopesAndAtomicMass.register( 'IsotopeTestChamber', IsotopeTestChamber );
export default IsotopeTestChamber;