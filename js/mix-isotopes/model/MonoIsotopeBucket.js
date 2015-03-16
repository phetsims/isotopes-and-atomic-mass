/** Copyright 2002-2015, University of Colorado
 *
 * A particle bucket that can only contain one configuration of isotope,
 * though it may contain multiple instances of that isotope.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var SphereBucket = require( 'PHETCOMMON/model/SphereBucket' );


  //public
  //class
  //MonoIsotopeParticleBucket
  //extends
  //SphereBucket < SphericalParticle > {
  //
  //  private final Dimension2D size = new PDimension();


  /**
   * Constructor.
   * @param {Vector2} position
   * @param {Dimension2} size
   * @param {Color} color
   * @param {String} caption
   * @param {number} particleRadius
   * @param {number} numProtonsInIsotope
   * @param {number} numNeutronsInIsotope
   */
  function MonoIsotopeBucket( position, size, baseColor, caption, particleRadius, numProtonsInIsotope, numNeutronsInIsotope ) {
    // call the supertype
    SphereBucket.call( {
      position: position,
      size: size,
      baseColor: baseColor,
      caption: caption,
      sphereRadius: particleRadius
    } );

    this.numProtonsInIsotope = numNeutronsInIsotope;
    this.numNeutronsInIsotope = numNeutronsInIsotope;

  }

  return inherit( SphereBucket, MonoIsotopeBucket, {
    /**
     * Add an isotope to the first open location in the bucket.
     *
     * @param isotope
     * @param moveImmediately
     */
    addIsotopeInstanceFirstOpen: function( isotope, moveImmediately ) {
      if ( isIsotopeAllowed( isotope.atomConfiguration ) ) {
        this.addParticleFirstOpen( isotope, moveImmediately );
      }
    },

    /**
     *
     * @param {number} numProtons
     * @param {number} numNeutrons
     * @returns {boolean}
     * TODO pick which of the following two functions to keep
     */

    isIsotopeAllowed: function( numProtons, numNeutrons ) {
      return this.numProtonsInIsotope === numProtons && this.numNeutronsInIsotope === numNeutrons;
    },

    /**
     *
     * @param {MovableAtom} isotopeConfig
     * @returns {*}
     */
    isIsotopeAllowedNumberAtom: function( isotopeConfig ) {
      return this.isIsotopeAllowed( isotopeConfig.protonCount, isotopeConfig.neutronCount );
    }

});

});

//


//  /**
//   * Add an isotope to the nearest open location in the bucket.
//   *
//   * @param isotope
//   * @param moveImmediately
//   */
//  public
//  void addIsotopeInstanceNearestOpen( MovableAtom
//  isotope, boolean
//  moveImmediately
//  )
//  {
//    if ( isIsotopeAllowed( isotope.getAtomConfiguration() ) ) {
//      addParticleNearestOpen( isotope, moveImmediately );
//    }
//  }
//

//

//
//  public
//  MovableAtom
//  removeArbitraryIsotope()
//  {
//    MovableAtom
//    isotopeToRemove = null;
//    if ( getParticleList().size() > 0 ) {
//      isotopeToRemove = (MovableAtom)
//      getParticleList().get( getParticleList().size() - 1 );
//      removeParticle( isotopeToRemove );
//    }
//    else {
//      System.err.println( getClass().getName() + " - Warning: Ignoring attempt to remove particle from empty bucket." );
//    }
//    return isotopeToRemove;
//  }
//
//  /**
//   * Get a list of all isotopes contained within this bucket.
//   */
//  public
//  List < MovableAtom > getContainedIsotopes()
//  {
//    List < MovableAtom > containedIsotopes = new ArrayList < MovableAtom > ();
//    for ( SphericalParticle isotope : getParticleList()
//  )
//    {
//      assert
//      isotope instanceof MovableAtom;
//      containedIsotopes.add( (MovableAtom)
//      isotope
//    )
//      ;
//    }
//    return containedIsotopes;
//  }
//}
//}
//)
;