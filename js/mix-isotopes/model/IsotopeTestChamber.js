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
  var Rectangle = require( 'DOT/Rectangle' );
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

  // Random number generator for generating positions.
  // TODO Is there an equivalent in JS? Should I just use Math.random()?
  // private static final Random RAND = new Random();


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
      isotopeCountProperty: 0,
      averageAtomicMassProperty: 0
    } );

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
      return TEST_CHAMBER_RECT.contains( isotope.position );
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
      if ( isIsotopePositionedOverChamber( isotope ) ) {
        containedIsotopes.push( isotope );
        // If the edges of the isotope are outside of the container,
        // move it to be fully inside.
        var protrusion = isotope.position.x + isotope.getRadius() - TEST_CHAMBER_RECT.getMaxX();
        if ( protrusion >= 0 ) {
          isotope.setPositionAndDestination( isotope.getPosition().getX() - protrusion,
            isotope.getPosition().getY() );
        }
        else {
          protrusion = TEST_CHAMBER_RECT.getMinX() - ( isotope.getPosition().getX() - isotope.getRadius() );
          if ( protrusion >= 0 ) {
            isotope.setPositionAndDestination( isotope.getPosition().getX() + protrusion,
              isotope.getPosition().getY() );
          }
        }
        protrusion = isotope.getPosition().getY() + isotope.getRadius() - TEST_CHAMBER_RECT.getMaxY();
        if ( protrusion >= 0 ) {
          isotope.setPositionAndDestination( isotope.getPosition().getX(),
            isotope.getPosition().getY() - protrusion );
        }
        else {
          protrusion = TEST_CHAMBER_RECT.getMinY() - ( isotope.getPosition().getY() - isotope.getRadius() );
          if ( protrusion >= 0 ) {
            isotope.setPositionAndDestination( isotope.getPosition().getX(),
              isotope.getPosition().getY() + protrusion );
          }
        }
        if ( performUpdates ) {
          // Update the isotope count.
          updateCountProperty();
          // Update the average atomic mass.
          averageAtomicMassProperty.set( ( ( averageAtomicMassProperty.get() *
                                             ( isotopeCountProperty.get() - 1 ) ) + isotope.getAtomConfiguration().getAtomicMass() ) /
                                         isotopeCountProperty.get() );
        }
      }
      else {
        // This isotope is not positioned correctly.
        System.err.println( getClass().getName() + " - Warning: Ignoring attempt to add incorrectly located isotope to test chamber." );
      }
    },


    /**
     * Adds a list of isotopes to the test chamber. Same restrictions as above.
     *
     * @param {MovableAtom[]} isotopeList
     */

    bulkAddIsotopesToChamber: function( isotopeList ) {
      for ( var isotope in isotopeList ) {
        addIsotopeToChamber( isotope, false );
      }
      updateCountProperty();
      updateAverageAtomicMassProperty();
    }


  } );
} );


//  public void removeIsotopeFromChamber( MovableAtom isotope ) {
//    containedIsotopes.remove( isotope );
//    updateCountProperty();
//    // Update the average atomic mass.
//    if ( isotopeCountProperty.get() > 0 ) {
//      averageAtomicMassProperty.set( ( averageAtomicMassProperty.get() * ( isotopeCountProperty.get() + 1 )
//                                       - isotope.getAtomConfiguration().getAtomicMass() ) / isotopeCountProperty.get() );
//    }
//    else {
//      averageAtomicMassProperty.set( 0.0 );
//    }
//  }
//
//  /**
//   * Remove an isotope from the chamber that matches the specified atom
//   * configuration.  Note that electrons are ignored.
//   */
//  public MovableAtom removeIsotopeMatchingConfig( ImmutableAtom isotopeConfig ) {
//    // Argument checking.
//    if ( isotopeConfig.getCharge() != 0 ) {
//      throw new IllegalArgumentException( "Isotope must be neutral" );
//    }
//    // Locate and remove a matching isotope.
//    MovableAtom removedIsotope = null;
//    for ( MovableAtom isotope : containedIsotopes ) {
//      if ( isotope.getAtomConfiguration().equals( isotopeConfig ) ) {
//        removedIsotope = isotope;
//        break;
//      }
//    }
//    removeIsotopeFromChamber( removedIsotope );
//    return removedIsotope;
//  }
//
//  public void removeAllIsotopes( boolean removeFromModel ) {
//    List<MovableAtom> containedIsotopesCopy = new ArrayList<MovableAtom>( containedIsotopes );
//    containedIsotopes.clear();
//    if ( removeFromModel ) {
//      for ( MovableAtom isotope : containedIsotopesCopy ) {
//        isotope.removeListener( model.isotopeGrabbedListener );
//        isotope.removedFromModel();
//      }
//    }
//    updateCountProperty();
//    averageAtomicMassProperty.set( 0.0 );
//
//    assert isotopeCountProperty.get() == 0;      // Logical consistency check.
//    assert averageAtomicMassProperty.get() == 0; // Logical consistency check.
//  }
//
//  protected List<MovableAtom> getContainedIsotopes() {
//    return containedIsotopes;
//  }
//
//  /**
//   * Get a count of the total number of isotopes in the chamber.
//   */
//  public int getTotalIsotopeCount() {
//    return isotopeCountProperty.get();
//  }
//
//
//  public void addTotalCountChangeObserver( SimpleObserver so ) {
//    isotopeCountProperty.addObserver( so );
//  }
//
//  private void updateCountProperty() {
//    isotopeCountProperty.set( containedIsotopes.size() );
//  }
//
//  private void updateAverageAtomicMassProperty() {
//    if ( containedIsotopes.size() > 0 ) {
//      double totalMass = 0;
//      for ( MovableAtom isotope : containedIsotopes ) {
//        totalMass += isotope.getAtomConfiguration().getAtomicMass();
//      }
//      averageAtomicMassProperty.set( totalMass / containedIsotopes.size() );
//    }
//    else {
//      averageAtomicMassProperty.set( 0.0 );
//    }
//  }
//
//  public void addAverageAtomicMassPropertyListener( SimpleObserver so ) {
//    averageAtomicMassProperty.addObserver( so );
//  }
//
//  public double getAverageAtomicMass() {
//    return averageAtomicMassProperty.get();
//  }
//
//  /**
//   * Get the proportion of isotopes currently within the chamber that
//   * match the specified configuration.  Note that electrons are
//   * ignored.
//   *
//   * @param isotopeConfig - Atom representing the configuration in
//   *                      question, MUST BE NEUTRAL.
//   * @return
//   */
//  public double getIsotopeProportion( ImmutableAtom isotopeConfig ) {
//    assert isotopeConfig.getCharge() == 0;
//    double isotopeProportion = 0;
//    int isotopeCount = 0;
//    for ( MovableAtom isotope : containedIsotopes ) {
//      if ( isotopeConfig.equals( isotope.getAtomConfiguration() ) ) {
//        isotopeCount++;
//      }
//    }
//    isotopeProportion = (double) isotopeCount / (double) containedIsotopes.size();
//    return isotopeProportion;
//  }
//
//  /**
//   * Move all the particles in the chamber such that they don't overlap.
//   * This is intended for usage where there are not a lot of particles in
//   * the chamber.  Using it in cases where there are a lost of particles
//   * could take a very long time.
//   */
//  public void adjustForOverlap() {
//    // Bounds checking.  The threshold is pretty much arbitrary.
//    if ( getTotalIsotopeCount() > 100 ) {
//      System.out.println( getClass().getName() + " - Warning: Ignoring request to adjust for overlap - too many particles in the chamber for that." );
//      return;
//    }
//
//    // Check for overlap and adjust particle positions until none exists.
//    int maxIterations = 10000;
//    for ( int i = 0; checkForParticleOverlap() && i < maxIterations; i++ ) {
//      // Adjustment factors for the repositioning algorithm.
//      double interParticleForceConst = 2000;
//      double wallForceConst = interParticleForceConst * 10;
//      double minInterParticleDistance = 0.0001;
//      Map<MovableAtom, MutableVector2D> mapIsotopesToForces = new HashMap<MovableAtom, MutableVector2D>();
//      for ( MovableAtom isotope1 : containedIsotopes ) {
//        MutableVector2D totalForce = new MutableVector2D( 0, 0 );
//        // Calculate the forces due to other isotopes.
//        for ( MovableAtom isotope2 : containedIsotopes ) {
//          if ( isotope1 == isotope2 ) {
//            // Same one, so skip it.
//            continue;
//          }
//          MutableVector2D forceFromIsotope = new MutableVector2D( 0, 0 );
//          double distanceBetweenIsotopes = isotope1.getPosition().distance( isotope2.getPosition() );
//          if ( distanceBetweenIsotopes == 0 ) {
//            // These isotopes are sitting right on top of one
//            // another.  Add the max amount of inter-particle
//            // force in a random direction.
//            forceFromIsotope.setMagnitude( interParticleForceConst / ( minInterParticleDistance * minInterParticleDistance ) );
//            forceFromIsotope.setAngle( RAND.nextDouble() * 2 * Math.PI );
//          }
//          else if ( distanceBetweenIsotopes < isotope1.getRadius() + isotope2.getRadius() ) {
//            // Calculate the repulsive force based on the distance.
//            forceFromIsotope.setComponents(
//              isotope1.getPosition().getX() - isotope2.getPosition().getX(),
//              isotope1.getPosition().getY() - isotope2.getPosition().getY() );
//            double distance = Math.max( forceFromIsotope.magnitude(), minInterParticleDistance );
//            forceFromIsotope.normalize();
//            forceFromIsotope.scale( interParticleForceConst / ( distance * distance ) );
//          }
//          totalForce.add( forceFromIsotope );
//        }
//        // Calculate the force due to the walls.  This prevents
//        // particles from being pushed out of the bounds of the
//        // chamber.
//        if ( isotope1.getPosition().getX() + isotope1.getRadius() >= TEST_CHAMBER_RECT.getMaxX() ) {
//          double distanceFromRightWall = TEST_CHAMBER_RECT.getMaxX() - isotope1.getPosition().getX();
//          totalForce.add( new Vector2D( -wallForceConst / ( distanceFromRightWall * distanceFromRightWall ), 0 ) );
//        }
//        else if ( isotope1.getPosition().getX() - isotope1.getRadius() <= TEST_CHAMBER_RECT.getMinX() ) {
//          double distanceFromLeftWall = isotope1.getPosition().getX() - TEST_CHAMBER_RECT.getMinX();
//          totalForce.add( new Vector2D( wallForceConst / ( distanceFromLeftWall * distanceFromLeftWall ), 0 ) );
//        }
//        if ( isotope1.getPosition().getY() + isotope1.getRadius() >= TEST_CHAMBER_RECT.getMaxY() ) {
//          double distanceFromTopWall = TEST_CHAMBER_RECT.getMaxY() - isotope1.getPosition().getY();
//          totalForce.add( new Vector2D( 0, -wallForceConst / ( distanceFromTopWall * distanceFromTopWall ) ) );
//        }
//        else if ( isotope1.getPosition().getY() - isotope1.getRadius() <= TEST_CHAMBER_RECT.getMinY() ) {
//          double distanceFromBottomWall = isotope1.getPosition().getY() - TEST_CHAMBER_RECT.getMinY();
//          totalForce.add( new Vector2D( 0, wallForceConst / ( distanceFromBottomWall * distanceFromBottomWall ) ) );
//        }
//
//        // Put the calculated repulsive force into the map.
//        mapIsotopesToForces.put( isotope1, totalForce );
//      }
//      // Adjust the particle positions based on forces.
//      for ( MovableAtom isotope : mapIsotopesToForces.keySet() ) {
//        isotope.setPositionAndDestination( mapIsotopesToForces.get( isotope ).getDestination( isotope.getPosition().toPoint2D() ) );
//      }
//      if ( i == maxIterations - 1 ) {
//        System.out.println( getClass().getName() + " - Warning: Hit max iterations of repositioning algorithm." );
//      }
//    }
//  }
//
//  private boolean checkForParticleOverlap() {
//    for ( MovableAtom isotope1 : containedIsotopes ) {
//      for ( MovableAtom isotope2 : containedIsotopes ) {
//        if ( isotope1 == isotope2 ) {
//          // Same isotope, so skip it.
//          continue;
//        }
//        double distance = isotope1.getPosition().distance( isotope2.getPosition() );
//        if ( distance < isotope1.getRadius() + isotope2.getRadius() ) {
//          return true;
//        }
//      }
//    }
//    return false;
//  }
//
//  /**
//   * Generate a random location within the test chamber.
//   *
//   * @return
//   */
//  public Point2D generateRandomLocation() {
//    return new Point2D.Double(
//      TEST_CHAMBER_RECT.getMinX() + RAND.nextDouble() * TEST_CHAMBER_RECT.getWidth(),
//      TEST_CHAMBER_RECT.getMinY() + RAND.nextDouble() * TEST_CHAMBER_RECT.getHeight() );
//  }
//
//  public State getState() {
//    return new State( this );
//  }
//
//  /**
//   * Restore a previously captured state.
//   */
//  public void setState( State state ) {
//    removeAllIsotopes( true );
//    bulkAddIsotopesToChamber( state.getContainedIsotopes() );
//  }
//
//  /**
//   * Class that contains the state of the isotope test chamber, and can be
//   * used for saving and later restoring the state.
//   */
//  public static class State {
//    private final List<MovableAtom> containedIsotopes;
//
//    public State( IsotopeTestChamber isotopeTestChamber ) {
//      this.containedIsotopes = new ArrayList<MovableAtom>( isotopeTestChamber.getContainedIsotopes() );
//    }
//
//    protected List<MovableAtom> getContainedIsotopes() {
//      return containedIsotopes;
//    }
//  }
