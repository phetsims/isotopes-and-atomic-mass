/* Copyright 2002-2015, University of Colorado */


/**
 * A Piccolo2D node that monitors that average atomic mass of a set of
 * isotopes in a model and graphically displays it.
 *
 * @author John Blanco
 * @author James Smith
 *
 */

define( function( require )  {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  // var Shape = require( 'KITE/shape' );
  var Line = require( 'SCENERY/nodes/line' );
  var Node = require( 'SCENERY/nodes/node' );
  // var SubSupText = require( 'SCENERY-PHET/js/SubSupText' );

  var INDICATOR_WIDTH = 300; // In screen units, which is close to pixels.

  /**
   * Convenience class for creating tick marks.  This includes both the
   * actual mark and the label.
   * @param
   */
  function IsotopeTickMark( isotopeConfig) {

    // Constants that control overall appearance, tweak as needed.
    // var OVERALL_HEIGHT = 40;
    var TICK_MARK_LINE_HEIGHT = 10;
    // var TICK_MARK_LABEL_HEIGHT = OVERALL_HEIGHT - TICK_MARK_LINE_HEIGHT;
    var TICK_MARK_LINEWIDTH = 5;

      // Create the tick mark itself.  It is positioned such that
      // (0,0) is the center of the mark.
      var shape = new Line( 0, -TICK_MARK_LINE_HEIGHT / 2, 0, TICK_MARK_LINE_HEIGHT / 2, {
        lineWidth: TICK_MARK_LINEWIDTH,
        stroke: 'black'
      });

      this.addChild( shape );
      // Create the label that goes above the tick mark.
      //var label = new HTMLNode( "<html><sup>" + isotopeConfig.getMassNumber() + "</sup>" + isotopeConfig.getSymbol() + "</html>" ); {{
      //  setFont( new PhetFont( 14 ) );
      //  setScale( TICK_MARK_LABEL_HEIGHT / getFullBoundsReference().height );
      //  setOffset( -getFullBoundsReference().width / 2, -getFullBoundsReference().height - TICK_MARK_LINE_HEIGHT / 2 );
      //}}
      //addChild( label );

  }



  /**
   *
   * @param {MixIsotopeModel} model
   * @constructor
   */
  function AverageAtomicMassIndicator( mixIsotopesModel ) {

    // var massSpan = 3; // In amu.
    // var minMass = 0; // In amu.


    // Root node onto which all other nodes are added.  This is done so
    // so that the root node can be offset at the end of construction in
    // such a way that the (0,0) location will be in the upper left corner.

    // Add the bar that makes up "spine" of the indicator.
    // var barOffsetY = 0;
    var barNode = new Line( 0, 0, INDICATOR_WIDTH, 0, {
      lineWidth: 3,
      stroke: 'black'
    });
    this.addChild( barNode );

    // Add the layer where the tick marks will be maintained.
    var tickMarkLayer = new Node();
    this.addChild( tickMarkLayer );

    // Listen for changes to the list of possible isotopes and update the
    // tick marks when changes occur.
    mixIsotopesModel.getPossibleIsotopesProperty().link(  function() {

        tickMarkLayer.removeAllChildren();
        var possibleIsotopesList = mixIsotopesModel.possibleIsotopes;
        var lightestIsotopeMass = Number.POSITIVE_INFINITY;
        var heaviestIsotopeMass = 0;
        this.minMass = Number.POSITIVE_INFINITY;
      possibleIsotopesList.forEach( function ( isotope ) {
        if ( isotope.getIsotopeAtomicMass() > heaviestIsotopeMass ) {
          heaviestIsotopeMass = isotope.getIsotopeAtomicMass();
        }
        if ( isotope.getIsotopeAtomicMass() < lightestIsotopeMass ) {
          lightestIsotopeMass = isotope.getIsotopeAtomicMass();
        }
      } );

        this.massSpan = heaviestIsotopeMass - lightestIsotopeMass;
        if ( this.massSpan < 2 ) {
          this.massSpan = 2; // Mass span must be at least 2 or the spacing doesn't look good.
        }
        // Adjust the span so that there is some space at the ends of the line.
        this.massSpan *= 1.2;
        // Set the low end of the mass range, needed for positioning on line.
        this.minMass = ( heaviestIsotopeMass + lightestIsotopeMass ) / 2 - this.massSpan / 2;

        // Add the new tick marks.
        mixIsotopesModel.possibleIsotopes.forEach( function( isotope ) {
          var tickMark = new IsotopeTickMark( isotope );
         // tickMark.setOffset( calcXOffsetFromAtomicMass( isotope.getAtomicMass() ), barOffsetY );
          tickMarkLayer.addChild( tickMark );
        });

    } );

    // Add the moving readout.
    //var readoutPointer = new ReadoutPointer( model );
    //readoutPointer.leftTop( barNode.bounds.CenterX, barOffsetY + 20 ) ;
    //this.addChild( readoutPointer );

    // Add a listener to position the moving readout in a location that
    // corresponds to the average atomic mass.
    //mixIsotopesModel.isotopeTestChamber.averageAtomicMass.link( function() {
    //  if ( model.getIsotopeTestChamber().getTotalIsotopeCount() > 0 ) {
    //    readoutPointer.leftTop( calcXOffsetFromAtomicMass( mixIsotopesModel.isotopeTestChamber.averageAtomicMass ), barOffsetY );
    //    readoutPointer.setVisible( true );
    //  }
    //  else {
    //    readoutPointer.setVisible( false );
    //  }
    //});


    // Set the root node's offset so that the (0,0) location for this node
    // is in the upper left.
    this.leftTop = new Vector2( 0, IsotopeTickMark.OVERALL_HEIGHT );
  }

  return inherit( Node, AverageAtomicMassIndicator, {
    /**
     * Calculate the X offset on the bar given the atomic mass.  This is
     * clamped to never return a value less than 0.
     *
     * @param {double} atomicMass
     * @return
     */
    calcXOffsetFromAtomicMass: function( atomicMass ) {
    return Math.max( ( atomicMass - this.minMass ) / this.massSpan * INDICATOR_WIDTH, 0 );
  }

  });

} );

//
//public class AverageAtomicMassIndicator extends PNode {
//

//
//

//

//  /**
//   * This class define the "readout pointer", which is an indicator
//   * that contains a textual indication of the average atomic mass and
//   * also has a pointer on the top that can be used to indicate the position
//   * on a linear scale.
//   * <p/>
//   * This node is set up such that the (0,0) point is at the top center of
//   * the node, which is where the point of the pointer exists.  This is done
//   * to make it easy to position the node under the mass indication line.
//   *
//   * @author John Blanco
//   */
//  private static final class ReadoutPointer extends PNode {
//
//    private static final Dimension2D SIZE = new PDimension( 120, 25 );
//    private static final double TRIANGULAR_POINTER_HEIGHT = 15;
//    private static final double TRIANGULAR_POINTER_WIDTH = 20;
//    private static final int DECIMAL_PLACES_FOR_USERS_MIX = 5;
//    private final MixIsotopesModel model;
//    private final PText textualReadout;
//    private final PNode readoutBackgroundNode;
//
//    public ReadoutPointer( MixIsotopesModel model ) {
//      this.model = model;
//      // Add the triangular pointer.  This is created such that the
//      // point of the triangle is at (0,0) for this node.
//      DoubleGeneralPath pointerShape = new DoubleGeneralPath( 0, 0 );
//      pointerShape.lineTo( -TRIANGULAR_POINTER_WIDTH / 2, TRIANGULAR_POINTER_HEIGHT );
//      pointerShape.lineTo( TRIANGULAR_POINTER_WIDTH / 2, TRIANGULAR_POINTER_HEIGHT );
//      pointerShape.closePath();
//      PNode triangularPointerNode = new PhetPPath( pointerShape.getGeneralPath(), new Color( 0, 143, 212 ) );
//      addChild( triangularPointerNode );
//
//      readoutBackgroundNode = new PhetPPath( new RoundRectangle2D.Double( -SIZE.getWidth() / 2,
//        TRIANGULAR_POINTER_HEIGHT, SIZE.getWidth(), SIZE.getHeight(), 5, 5 ), Color.WHITE, new BasicStroke( 1 ), Color.BLACK );
//      addChild( readoutBackgroundNode );
//
//      textualReadout = new PText() {{
//        setFont( new PhetFont( 18 ) );
//      }};
//      addChild( textualReadout );
//
//      // Observe the average atomic weight property in the model and
//      // update the textual readout whenever it changes.
//      model.getIsotopeTestChamber().addAverageAtomicMassPropertyListener( new SimpleObserver() {
//        public void update() {
//          updateReadout();
//        }
//      } );
//      // Observe whether the user's mix or nature's mix is being
//      // portrayed and update the readout when this changes.
//      model.getShowingNaturesMixProperty().addObserver( new SimpleObserver() {
//        public void update() {
//          updateReadout();
//        }
//      } );
//    }
//
//    private void updateReadout() {
//      double weight;
//      int numDecimalPlacesToDisplay;
//      if ( model.getShowingNaturesMixProperty().get() ) {
//        weight = AtomIdentifier.getStandardAtomicMassPrecisionDecimal( model.getAtom().getNumProtons() ).getPreciseValue();
//        numDecimalPlacesToDisplay = Math.min(
//          AtomIdentifier.getStandardAtomicMassPrecisionDecimal( model.getAtom().getNumProtons() ).getNumberOfDecimalPlaces(),
//          5 ); // Max of 5 decimal places of resolution.
//      }
//      else {
//        weight = model.getIsotopeTestChamber().getAverageAtomicMass();
//        numDecimalPlacesToDisplay = DECIMAL_PLACES_FOR_USERS_MIX;
//      }
//      textualReadout.setText( VariablePrecisionNumberFormat.format( weight, numDecimalPlacesToDisplay ) + BuildAnAtomStrings.UNITS_AMU );
//      textualReadout.setScale( 1 );
//      if ( textualReadout.getFullBoundsReference().width >= readoutBackgroundNode.getFullBoundsReference().getWidth() * 0.95 ) {
//        textualReadout.setScale( readoutBackgroundNode.getFullBoundsReference().width / textualReadout.getFullBoundsReference().width * 0.95 );
//      }
//      textualReadout.centerFullBoundsOnPoint(
//        readoutBackgroundNode.getFullBoundsReference().getCenterX(),
//        readoutBackgroundNode.getFullBounds().getCenterY() );
//    }
//  }
//}
