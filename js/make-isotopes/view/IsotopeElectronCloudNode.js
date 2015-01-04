//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Node that represents the electron shells in an isotope as a "cloud" that grows and shrinks depending on the number
 * of electrons that it contains.  This particular class implements behavior needed for the Isotopes simulation, which
 * is somewhat different from that needed for Build an Atom.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */


define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var dot = require( 'DOT/dot' );
  var LinearFunction = require( 'DOT/LinearFunction' );

  // class data
  var CLOUD_BASE_COLOR = 'blue'; // Base color to use when drawing clouds.
  var MAX_ELECTRONS = 10; // For neon.

  /**
   * Constructor for the Isotope Electron Cloud.
   *
   * @param {ParticleAtom} atom
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function IsotopeElectronCloudNode( atom, modelViewTransform ) {

    // Call super constructor.
    Node.call( this, { pickable: false } );

    var electronCloud = new Circle( modelViewTransform.modelToViewDeltaX( atom.outerElectronShellRadius ),
      {
        fill: 'pink',
        translation: modelViewTransform.modelToViewPosition( {x: 0, y: 0 } )
      }
    );
    this.addChild( electronCloud );

    var updateElectronCloud = function( numElectrons ) {

      // Function that updates the size of the cloud based on the number of electrons.
      var electronCountToAlphaMapping = new dot.LinearFunction( 0, MAX_ELECTRONS, 80, 110 );
      var alpha = 0; // If there are no electrons, be transparent.

      if ( numElectrons === 0 ) {
        electronCloud.radius = 1E-5; // Arbitrary non-zero value.
        electronCloud.fill = 'transparent';
      }

      else {
        alpha = electronCountToAlphaMapping( numElectrons );
        alpha /= 255; // Convert value to fraction of 255 for compliance with HTML5 radial gradient.  This could be done implicitly in the mapping.

        var minRadius = modelViewTransform.modelToViewDeltaX( atom.innerElectronShellRadius ) * 0.5;
        var maxRadius = modelViewTransform.modelToViewDeltaX( atom.outerElectronShellRadius );
        var radius = minRadius + ( ( maxRadius - minRadius ) / MAX_ELECTRONS ) * numElectrons;
        electronCloud.radius = radius;
        electronCloud.fill = new RadialGradient( 0, 0, 0, 0, 0, radius )
          .addColorStop( 0.33, 'rgba( 0, 0, 255, 0 )' )
          .addColorStop( 1, 'rgba( 0, 0, 255, ' + alpha + ' )' );
      }
    };
    updateElectronCloud( atom.electrons.length );

    // Update the cloud size as electrons come and go.
    atom.electrons.lengthProperty.link( function( length ) {
      updateElectronCloud( length );
    } );

  }

  // Inherit from Node.
  return inherit( Node, IsotopeElectronCloudNode );

} );

// TODO: The following may still need to be ported, keeping it here for reference.
//
//  /**
//   * Maps a number of electrons to a diameter in screen coordinates for the
//   * electron shell.  This mapping function is based on the real size
//   * relationships between the various atoms, but has some tweakable
//   * parameters to reduce the range and scale to provide values that
//   * are usable for our needs on the canvas.
//   */
//  private double getElectronShellDiameter( int numElectrons ) {
//    if ( mapElectronCountToRadius.containsKey( numElectrons ) ) {
//      return reduceRadiusRange( mapElectronCountToRadius.get( numElectrons ) );
//    }
//    else {
//      if ( numElectrons > MAX_ELECTRONS ) {
//        System.out.println( getClass().getName() + " - Warning: Atom has more than supported number of electrons, " + numElectrons );
//      }
//      return 0;
//    }
//  }
//
//  // This data structure maps atomic number of atomic radius.  The values
//  // are the covalent radii, and were taken from a Wikipedia entry entitled
//  // "Atomic radii of the elements".  Values are in picometers.
//  private static Map<Integer, Double> mapElectronCountToRadius = new HashMap<Integer, Double>() {{
//    put( 1, 38d );   // Hydrogen
//    put( 2, 32d );   // Helium
//    put( 3, 134d );  // Lithium
//    put( 4, 90d );   // Beryllium
//    put( 5, 82d );   // Boron
//    put( 6, 77d );   // Carbon
//    put( 7, 75d );   // Nitrogen
//    put( 8, 73d );   // Oxygen
//    put( 9, 71d );   // Fluorine
//    put( 10, 69d );  // Neon
//  }};
//
//  // Determine the min and max radii of the supported atoms.
//  private static double minShellRadius, maxShellRadius;
//
//  static {
//    minShellRadius = Double.MAX_VALUE;
//    maxShellRadius = 0;
//    for ( Double radius : mapElectronCountToRadius.values() ) {
//      if ( radius > maxShellRadius ) {
//        maxShellRadius = radius;
//      }
//      if ( radius < minShellRadius ) {
//        minShellRadius = radius;
//      }
//    }
//  }
//
//  /**
//   * This method increases the value of the smaller radius values and
//   * decreases the value of the larger ones.  This effectively reduces
//   * the range of radii values used.
//   * <p/>
//   * This is a very specialized function for the purposes of this class.
//   */
//  private double reduceRadiusRange( double value ) {
//    // The following two factors define the way in which an input value is
//    // increased or decreased.  These values can be adjusted as needed
//    // to make the cloud size appear as desired.
//    double minChangedRadius = 40;
//    double maxChangedRadius = 100;
//
//    Function.LinearFunction compressionFunction = new Function.LinearFunction( minShellRadius, maxShellRadius, minChangedRadius, maxChangedRadius );
//    return compressionFunction.evaluate( value );
//  }
//}
