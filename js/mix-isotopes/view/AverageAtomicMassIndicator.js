// Copyright 2015-2016, University of Colorado Boulder

/**
 * monitors the average atomic mass of a set of isotopes in a model and displays it.
 *
 * @author John Blanco
 * @author James Smith
 * @author Aadish Gupta
 *
 */

define( function( require ) {
  'use strict';

  // modules
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var SubSupText = require( 'SCENERY_PHET/SubSupText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var INDICATOR_WIDTH = 200;
  var TICK_MARK_LINE_HEIGHT = 15;
  var TICK_MARK_LINE_WIDTH = 5;
  var SIZE = new Dimension2( 75, 25 );
  var TRIANGULAR_POINTER_HEIGHT = 15;
  var TRIANGULAR_POINTER_WIDTH = 20;
  var NUMBER_DECIMALS = 5;

  // strings
  var amuString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/amu' );

  /**
   * Convenience function for creating tick marks. This includes both the actual mark and the label.
   * @param {NumberAtom} isotopeConfig
   */
  function IsotopeTickMark( isotopeConfig ) {
    var node = new Node();

    // Create the tick mark itself.  It is positioned such that (0,0) is the center of the mark.
    var shape = new Line( 0, -TICK_MARK_LINE_HEIGHT / 2, 0, TICK_MARK_LINE_HEIGHT / 2, {
      lineWidth: TICK_MARK_LINE_WIDTH,
      stroke: 'black'
    } );
    node.addChild( shape );

    // Create the label that goes above the tick mark.
    var label = new SubSupText( ' <sup>' + isotopeConfig.massNumber + '</sup>' +
      AtomIdentifier.getSymbol( isotopeConfig.protonCount ), {
        font: new PhetFont( 12 )
      } );
    label.centerX = shape.centerX;
    label.bottom = shape.top;
    node.addChild( label );

    return node;
  }

  /**
   * This convenience define the "readout pointer", which is an indicator that contains a textual indication of the
   * average atomic mass and also has a pointer on the top that can be used to indicate the position on a linear scale.
   * This node is set up such that the (0,0) point is at the top center of the node, which is where the point of the
   * pointer exists. This is done to make it easy to position the node under the mass indication line.
   *
   * @param {MixIsotopeModel} model
   */
  function ReadoutPointer( model ) {
    var node = new Node();

    this.model = model;
    // Add the triangular pointer. This is created such that the point of the triangle is at (0,0) for this node.

    var vertices = [ new Vector2( -TRIANGULAR_POINTER_WIDTH / 2, TRIANGULAR_POINTER_HEIGHT ),
      new Vector2( TRIANGULAR_POINTER_WIDTH / 2, TRIANGULAR_POINTER_HEIGHT ),
      new Vector2( 0, 0 )
    ];

    var triangle = new Path( Shape.polygon( vertices ), {
      fill: new Color( 0, 143, 212 ),
      lineWidth: 1
    } );
    node.addChild( triangle );

    var readoutText = new Text( '', {
      font: new PhetFont( 14 ),
      maxWidth: 0.9 * SIZE.width,
      maxHeight: 0.9 * SIZE.height
    } );

    var readoutPanel = new Panel( readoutText, {
      minWidth: SIZE.width,
      minHeight: SIZE.height,
      resize: false,
      cornerRadius: 2,
      lineWidth: 1,
      align: 'center',
      fill: 'white'
    } );

    readoutPanel.top = triangle.bottom;
    readoutPanel.centerX = triangle.centerX;
    node.addChild( readoutPanel );

    function updateReadout( averageAtomicMass ) {
      var weight;
      if ( model.showingNaturesMix ) {
        weight = AtomIdentifier.getStandardAtomicMass( model.numberAtom.protonCount );
      } else {
        weight = averageAtomicMass;
      }
      readoutText.setText( Util.toFixed( weight, NUMBER_DECIMALS ) + ' ' + amuString );
      readoutText.centerX = SIZE.width / 2;
    }

    // Observe the average atomic weight property in the model and update the textual readout whenever it changes.
    // Doesn't need unlink as it stays through out the sim life
    model.testChamber.averageAtomicMassProperty.link( function( averageAtomicMass ) {
      updateReadout( averageAtomicMass );
    } );

    return node;
  }

  /**
   * @param {MixIsotopesModel} model
   * @constructor
   */
  function AverageAtomicMassIndicator( model ) {
    Node.call( this );
    var self = this;

    // Root node onto which all other nodes are added.  This is done so that the root node can be offset at the end of
    // construction in such a way that the (0,0) location will be in the upper left corner.

    // Add the bar that makes up "spine" of the indicator.
    var barNode = new Line( 0, 0, INDICATOR_WIDTH, 0, {
      lineWidth: 3,
      stroke: 'black'
    } );
    this.addChild( barNode );

    // Add the layer where the tick marks will be maintained.
    var tickMarkLayer = new Node();
    this.addChild( tickMarkLayer );

    // Listen for changes to the list of possible isotopes and update the tick marks when changes occur.
    // Doesn't need unlink as it stays through out the sim life
    model.possibleIsotopesProperty.link( function() {

      tickMarkLayer.removeAllChildren();
      var possibleIsotopesList = model.possibleIsotopes;
      var lightestIsotopeMass = Number.POSITIVE_INFINITY;
      var heaviestIsotopeMass = 0;
      self.minMass = Number.POSITIVE_INFINITY;
      possibleIsotopesList.forEach( function( isotope ) {
        if ( isotope.getIsotopeAtomicMass() > heaviestIsotopeMass ) {
          heaviestIsotopeMass = isotope.getIsotopeAtomicMass();
        }
        if ( isotope.getIsotopeAtomicMass() < lightestIsotopeMass ) {
          lightestIsotopeMass = isotope.getIsotopeAtomicMass();
        }
      } );

      self.massSpan = heaviestIsotopeMass - lightestIsotopeMass;
      if ( self.massSpan < 2 ) {
        self.massSpan = 2; // Mass spa n must be at least 2 or the spacing doesn't look good.
      }
      // Adjust the span so that there is some space at the ends of the line.
      self.massSpan *= 1.2;
      // Set the low end of the mass range, needed for positioning on line.
      self.minMass = ( heaviestIsotopeMass + lightestIsotopeMass ) / 2 - self.massSpan / 2;

      // Add the new tick marks.
      model.possibleIsotopes.forEach( function( isotope ) {
        var tickMark = new IsotopeTickMark( isotope );
        tickMark.centerX = self.calcXOffsetFromAtomicMass( isotope.getIsotopeAtomicMass() );
        tickMarkLayer.addChild( tickMark );
      } );

    } );

    // Add the moving readout.
    var readoutPointer = new ReadoutPointer( model );
    readoutPointer.top = barNode.bottom;
    readoutPointer.centerX = barNode.centerX;
    this.addChild( readoutPointer );

    // Doesn't need unlink as it stays through out the sim life
    model.testChamber.averageAtomicMassProperty.link( function( averageAtomicMass ) {
      if ( model.testChamber.isotopeCount > 0 ) {
        readoutPointer.centerX = self.calcXOffsetFromAtomicMass( averageAtomicMass );
        readoutPointer.setVisible( true );
      } else {
        readoutPointer.setVisible( false );
      }
    } );
  }

  isotopesAndAtomicMass.register( 'AverageAtomicMassIndicator', AverageAtomicMassIndicator );
  return inherit( Node, AverageAtomicMassIndicator, {
    /**
     * Calculate the X offset on the bar given the atomic mass. This is clamped to never return a value less than 0.
     *
     * @param {double} atomicMass
     * @return
     */
    calcXOffsetFromAtomicMass: function( atomicMass ) {
      return Math.max( ( atomicMass - this.minMass ) / this.massSpan * INDICATOR_WIDTH, 0 );
    }

  } );

} );

