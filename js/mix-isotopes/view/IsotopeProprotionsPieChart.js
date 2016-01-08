// Copyright 2016, University of Colorado Boulder

/**
 * Class that represents a pie chart portraying the proportion of the various isotopes in the test chamber.
 *
 * @author Aadish Gupta
 *
 */
define( function( require ) {
  'use strict';

  // modules
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PieChartNode = require( 'ISOTOPES_AND_ATOMIC_MASS/common/view/PieChartNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var PIE_CHART_RADIUS = 50;
  var READOUT_FONT = new PhetFont( 18 );
  var SIZE = new Dimension2( 50, 20 );
  var CHEMICAL_SYMBOL_FONT = new PhetFont( 16 );
  var SUPERSCRIPT_SUBSCRIPT_FONT = new PhetFont( 14 );
  var NUMBER_DECIMALS = 4;

  /**
   * Class that represents a chemical symbol, including the mass number(in front of the chemical symbol and partially above it)
   * and the atomic number (in front of the chemical symbol and partially below it).
  */

  function ChemSymbolWithNumbersNode( isotopeConfig ) {
    var node = new Node();

    var symbol = new Text( AtomIdentifier.getSymbol( isotopeConfig.protonCount ), {
      font: CHEMICAL_SYMBOL_FONT,
      centerX: 0,
      centerY: 0
    } );
    node.addChild( symbol );

    var massNumber = new Text( isotopeConfig.massNumber, {
      font: SUPERSCRIPT_SUBSCRIPT_FONT,
      centerY: symbol.top
    } );
    massNumber.right = symbol.left;
    node.addChild(massNumber);

    var atomicNumber = new Text( isotopeConfig.protonCount , {
      font: SUPERSCRIPT_SUBSCRIPT_FONT,
      centerY: symbol.bottom
    } );
    atomicNumber.right = symbol.left;
    //atomicNumber.centerY = symbol.height * 0.6;
    node.addChild( atomicNumber );

    return node;
  }

  function SliceLabelNode( isotopeConfig, isotopePercentage, labelOnLeft, numberOfDecimals ) {
    // The "unconstrained position" is the position where this label
    // would be placed if it didn't need to sit within the upper and
    // lower bounds of the pie chart and didn't have to worry about
    // avoiding overlap with other labels.  It is used for arbitrating
    // how labels move when handling overlap.
    this.unconstrainedPos = new Vector2( 0, 0 );
    this.labelOnLeft = labelOnLeft;
    var node = new Node();
    var symbol = new ChemSymbolWithNumbersNode( isotopeConfig );
    node.addChild( symbol );

    var readoutText = new Text( Util.toFixedNumber( isotopePercentage, numberOfDecimals )+ ' %', {
      font: READOUT_FONT,
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
    readoutText.centerX = SIZE.width / 2;
    node.addChild( readoutPanel );

    // Make the two portions of the label line up on the horizontal axis
    if ( symbol.height > readoutPanel.height ) {
      readoutPanel.centerY = symbol.centerY;
    }
    else {
      symbol.centerY = readoutPanel.centerY;
    }

    // Position the elements of the overall label.
    if ( labelOnLeft ) {
      readoutPanel.left = symbol.right + 5;
      readoutText.centerX = readoutPanel.width / 2;
    }
    else {
      symbol.left = readoutPanel.right + 5;
    }
    return node;
  }

  function IsotopeProprotionsPieChart( model ) {
    var self = this;
    Node.call( this );
    var labelLayer = new Node();
    this.addChild( labelLayer );
    var pieChartBoundingRectangle = new Rectangle( 150, 0, 65 * 2, 65 * 2, 0, 0 );
    var emptyCircle = new Circle( PIE_CHART_RADIUS, { stroke: 'black', lineDash: [ 3, 1 ] } );
    emptyCircle.centerX = pieChartBoundingRectangle.width / 2 + 150;
    emptyCircle.centerY = pieChartBoundingRectangle.height / 2 ;
    pieChartBoundingRectangle.addChild( emptyCircle );


    // default slices this will be updated based on possible isotopes
    var slices = [ ];
    var sliceLabels = [ ];
    var pieChart = new PieChartNode( slices, PIE_CHART_RADIUS );
    pieChart.setCenter( pieChartBoundingRectangle.width / 2 + 150, pieChartBoundingRectangle.height / 2 );
    pieChartBoundingRectangle.addChild( pieChart );

    //pieChartBoundingRectangle.scale(0.6);
    this.addChild( pieChartBoundingRectangle );

    function adjustLabelPositionsForOverlap( sliceLabels, minY, maxY ) {
      var rotationIncrement = Math.PI / 200; // Empirically chosen.
      for ( var i = 1; i < 50; i++ ) { // Number of iterations empirically chosen.
        var overlapDetected = false;
        sliceLabels.forEach( function( label ) {
          var moveUp = false;
          var moveDown = false;
          for ( var j = 0; j < sliceLabels.length; j++ ) {
            var comparisonLabel = sliceLabels[ j ];
            if ( label == comparisonLabel ) {
              // Same label, so ignore.
              continue;
            }
            if ( label.bounds.intersectsBounds( comparisonLabel.bounds ) ) {
              // These labels overlap.
              overlapDetected = true;
              if ( label.unconstrainedPos.y > comparisonLabel.unconstrainedPos.y && label.bottom < maxY ) {
                moveUp = true;
              }
              else if ( label.unconstrainedPos.y < comparisonLabel.unconstrainedPos.y && label.top > minY ) {
                moveDown = true;
              }
            }
          }
          // Adjust this label's position based upon any overlap that
          // was detected.  The general idea is this: if there is
          // overlap in both directions, don't move.  If there is only
          // overlap with a label that has a higher unconstrained
          // location, move down.  If there is only overlap with a label
          // with a lower unconstrained location, move down.
          if ( moveUp && !moveDown ) {
            if ( label.labelOnLeft ) {
              var posVector = new Vector2( label.right, label.centerY + label.height / 2 );
              posVector.rotate( -rotationIncrement );
              label.centerX = posVector.x - label.width;
              label.centerY = posVector.y - label.height / 2;

            }
            else {
              var posVector = new Vector2( label.centerX, label.centerY + label.height / 2 );
              posVector.rotate( rotationIncrement );
              label.centerX = posVector.x;
              label.centerY = posVector.y - label.height / 2;
            }
          }
          else if ( moveDown && !moveUp ) {
            if ( label.labelOnLeft ) {
              var posVector = new Vector2( label.right, label.centerY + label.height / 2 );
              posVector.rotate( rotationIncrement );
              label.centerX = posVector.x - label.width;
              label.centerY = posVector.y - label.height / 2;

            }
            else {
              var posVector = new Vector2( label.centerX, label.centerY + label.height / 2 );
              posVector.rotate( -rotationIncrement );
              label.centerX = posVector.x,
                label.centerY = posVector.y - label.height / 2;
            }
          }
        });
        if ( !overlapDetected ) {
          // No overlap for any of the labels, so we are done.
          break;
        }
      }
    }

    function updateLabels( possibleIsotopes ) {
      labelLayer.removeAllChildren();
      sliceLabels = [ ];
      var i = 0;
      possibleIsotopes.forEach( function( isotope ) {
        var proportion;
        if ( model.showingNaturesMix ) {
          proportion = AtomIdentifier.getNaturalAbundancePreciseDecimal( isotope );
        }
        else {
          proportion = model.testChamber.getIsotopeProportion( isotope );
        }

        var centerEdgeOfPieSlice = pieChart.getCenterEdgePtForSlice( i );
        if ( centerEdgeOfPieSlice ) {
          var labelOnLeft = centerEdgeOfPieSlice.x <= pieChart.centerXCord;
          var numberOfDecimals = model.showingNaturesMix ? NUMBER_DECIMALS : 1;
          var labelNode = new SliceLabelNode( isotope, slices[ i ].value / pieChart.getTotal() * 100, labelOnLeft, numberOfDecimals );
          //labelNode.scale( 0.8 );

          //sliceLabels.add( labelNode );

          // Determine the "unconstrained" target position
          // for the label, meaning a position that is
          // directly out from the edge of the slice, but
          // may be above or below the edges of the pie
          // chart.
          var positionVector = centerEdgeOfPieSlice;
          //positionVector.multiply( 1.4 );
          //labelNode.setUnconstrainedPos( positionVector.getX(), positionVector.getY() );

          // Constrain the position so that no part of the
          // label goes above or below the upper and lower
          // edges of the pie chart.
          var minY = pieChart.top;
          var maxY = pieChart.bottom;
          var xSign = labelOnLeft ? -1 : 1;
          if ( positionVector.y < minY ) {
            positionVector.x = pieChart.centerX + xSign * pieChart.radius;
            positionVector.y = minY;
          }
          else if ( positionVector.y > maxY ) {
            positionVector.x = pieChart.centerX + xSign * pieChart.radius;
            positionVector.y = maxY;
          }

          // Position the label.
          if ( labelOnLeft ) {
            labelNode.right = positionVector.x - labelNode.width / 2;
            labelNode.centerY = positionVector.y;
          }
          else {
            // Label on right.
            labelNode.left = positionVector.x + labelNode.width / 2;
            labelNode.centerY = positionVector.y;
          }
          labelLayer.addChild( labelNode );
          labelNode.unconstrainedPos = labelNode.center;
          sliceLabels.push( labelNode );
        }
        i = i + 1;
      } );
      adjustLabelPositionsForOverlap( sliceLabels, pieChart.top, pieChart.bottom );

    }

    function updatePieChart(){
      slices = [ ];
      var i = 0;
      model.possibleIsotopes.forEach( function( isotope ) {
        var value = model.testChamber.getIsotopeCount( isotope );
        var color = model.getColorForIsotope( isotope );
        slices[ i ] = { value:value, color:color, stroke:'black', lineWidth: 0.5 };
        i += 1;
      } );
      var lightestIsotopeProportion = slices[ 0 ].value / model.testChamber.isotopeCount;
      pieChart.setAngleAndValues( Math.PI - ( lightestIsotopeProportion * Math.PI ), slices );
      updateLabels( model.possibleIsotopes );
    }

    model.testChamber.isotopeCountProperty.link( function( isotopeCount ) {
      if ( isotopeCount > 0 ) {
        emptyCircle.setVisible( false );
        updatePieChart();
        pieChart.setVisible( true );
        labelLayer.setVisible( true );
      }
      else {
        emptyCircle.setVisible( true );
        pieChart.setVisible( false );
        labelLayer.setVisible( false );
      }
    } );
  }

  return inherit( Node, IsotopeProprotionsPieChart, {
    //TODO prototypes
  } );
} );


//class IsotopeProprotionsPieChart extends PNode {
//
//  private static final double OVERALL_HEIGHT = 120;
//  private static final int PIE_CHART_DIAMETER = 80; // Must be less than overall height.
//  private static final Stroke CONNECTING_LINE_STROKE = new BasicStroke( 1 );
//
//  /**
//   * Constructor.
//   */
//  public IsotopeProprotionsPieChart( final MixIsotopesModel model ) {
//  // Create and add a layer where the labels will be placed.
//  final PNode labelLayer = new PNode();
//  addChild( labelLayer );
//  // Create and add the pie chart itself.  Initial color is arbitrary.
//  final PieChartNode pieChart = new PieChartNode( new PieValue[] { new PieValue( 100, Color.yellow ) },
//new Rectangle( -PIE_CHART_DIAMETER / 2, -PIE_CHART_DIAMETER / 2, PIE_CHART_DIAMETER, PIE_CHART_DIAMETER ) ) {{
//  setOffset( 0, 0 );
//}};
//addChild( pieChart );
//// Create and add the node that will be shown when there is nothing
//// in the chamber, since showing a pie chart would make no sense.
//final PNode emptyPieChart = new PhetPPath(
//  new Ellipse2D.Double( -PIE_CHART_DIAMETER / 2, -PIE_CHART_DIAMETER / 2, PIE_CHART_DIAMETER, PIE_CHART_DIAMETER ),
//  new BasicStroke( 1, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL, 0, new float[] { 5, 4 }, 0 ), Color.black ) {{
//  setOffset( 0, 0 );
//}};
//addChild( emptyPieChart );
//// Add the observer that will update the pie chart when the contents
//// of the test chamber change.
//model.getIsotopeTestChamber().addTotalCountChangeObserver( new SimpleObserver() {
//  public void update() {
//    boolean isotopesInChamber = model.getIsotopeTestChamber().getTotalIsotopeCount() > 0;
//    // Only show the chart if there is nothing in the chamber.
//    pieChart.setVisible( isotopesInChamber );
//    labelLayer.setVisible( isotopesInChamber );
//    emptyPieChart.setVisible( !isotopesInChamber );
//    if ( isotopesInChamber ) {
//      // Clear the current labels.
//      labelLayer.removeAllChildren();
//      // Update the proportions of the pie slices.
//      ArrayList<IsotopePieValue> pieSlices = new ArrayList<IsotopePieValue>();
//      for ( ImmutableAtom isotope : model.getPossibleIsotopesProperty().get() ) {
//        PrecisionDecimal proportion;
//        if ( model.getShowingNaturesMixProperty().get() ) {
//          proportion = AtomIdentifier.getNaturalAbundancePrecisionDecimal( isotope );
//        }
//        else {
//          // The chemists requested that we just show one
//          // decimal place of precision when showing the
//          // user's mix.  Since the proportion is multiplied
//          // by 100 to obtain the percentage, we need to set
//          // the resolution to 3 here.
//          proportion = new PrecisionDecimal( model.getIsotopeTestChamber().getIsotopeProportion( isotope ), 3 );
//        }
//        // Only add non-zero values.
//        if ( proportion.getPreciseValue() > 0 ) {
//          pieSlices.add( new IsotopePieValue( isotope, proportion, model.getColorForIsotope( isotope ) ) );
//        }
//      }
//      // Convert the pie value array into the type needed by the
//      // pie chart and set the values.
//      pieChart.setPieValues( pieSlices.toArray( new PieValue[pieSlices.size()] ) );
//
//      // TODO: The following was put in to catch a race condition where
//      // there could be isotopes in the chamber, but none that matched
//      // the current prototype isotope.  Changes were made that
//      // appeared to fix this, but this check should be left for a
//      // while to make sure that it doesn't come back.  If the
//      // errors from this haven't been seen for a while, it can
//      // probably be safely removed.  jblanco, mid-March 2011.
//      if ( pieSlices.size() == 0 ) {
//        System.out.println( "No pie slices, aborting update of chart." );
//        System.out.println( "Prototype isotope = " + model.getAtom().toImmutableAtom() );
//        System.out.println( "Possible Isotopes: " );
//        for ( ImmutableAtom isotope : model.getPossibleIsotopesProperty().get() ) {
//          System.out.println( "   " + isotope );
//        }
//        return;
//      }
//
//      // Orient the pie chart such that the slice for the
//      // lightest element is centered on the left side.  This
//      // is done to make the chart behave in a why that causes
//      // the labels to be in consistent and reasonable
//      // positions.
//      double lightestIsotopeProportion = pieSlices.get( 0 ).getValue() / pieChart.getTotal();
//      pieChart.setInitialAngle( Math.PI - ( lightestIsotopeProportion * Math.PI ) );
//      // Add the floating labels to the chart.
//      ArrayList<SliceLabel> sliceLabels = new ArrayList<SliceLabel>();
//      for ( int i = 0; i < pieSlices.size(); i++ ) {
//        // Create the label for this pie slice.
//        SliceLabel labelNode;
//        Point2D centerEdgeOfPieSlice = pieChart.getCenterEdgePtForSlice( i );
//        boolean labelOnLeft = centerEdgeOfPieSlice.getX() < 0;
//        labelNode = new SliceLabel( pieSlices.get( i ).getIsotopeConfig(),
//          pieSlices.get( i ).getValue() / pieChart.getTotal() * 100,
//          pieSlices.get( i ).getPrecisionDecimal().getNumberOfDecimalPlaces() - 2,//Reduce precision by 2 since we multiplied by 2 orders of magnitude
//          labelOnLeft );
//        labelLayer.addChild( labelNode );
//        sliceLabels.add( labelNode );
//
//        // Determine the "unconstrained" target position
//        // for the label, meaning a position that is
//        // directly out from the edge of the slice, but
//        // may be above or below the edges of the pie
//        // chart.
//        MutableVector2D positionVector = new MutableVector2D( centerEdgeOfPieSlice );
//        positionVector.scale( 1.4 );
//        labelNode.setUnconstrainedPos( positionVector.getX(), positionVector.getY() );
//
//        // Constrain the position so that no part of the
//        // label goes above or below the upper and lower
//        // edges of the pie chart.
//        double minY = -OVERALL_HEIGHT / 2 + labelNode.getFullBoundsReference().height / 2;
//        double maxY = OVERALL_HEIGHT / 2 - labelNode.getFullBoundsReference().height / 2;
//        double xSign = labelOnLeft ? -1 : 1;
//        if ( positionVector.getY() < minY ) {
//          positionVector.setX( xSign * Math.sqrt( positionVector.magnitudeSquared() - minY * minY ) );
//          positionVector.setY( minY );
//        }
//        else if ( positionVector.getY() > maxY ) {
//          positionVector.setX( xSign * Math.sqrt( positionVector.magnitudeSquared() - maxY * maxY ) );
//          positionVector.setY( maxY );
//        }
//
//        // Position the label.
//        if ( labelOnLeft ) {
//          labelNode.setOffset(
//            positionVector.getX() - labelNode.getFullBoundsReference().width,
//            positionVector.getY() - labelNode.getFullBoundsReference().height / 2 );
//        }
//        else {
//          // Label on right.
//          labelNode.setOffset(
//            positionVector.getX(),
//            positionVector.getY() - labelNode.getFullBoundsReference().height / 2 );
//        }
//      }
//      // Now that the labels are added in their initial
//      // positions, they need to be checked to make sure that
//      // they aren't overlapping and, if they are, their
//      // positions are adjusted.
//      adjustLabelPositionsForOverlap( sliceLabels, -OVERALL_HEIGHT / 2, OVERALL_HEIGHT / 2 );
//
//      // The labels should now be all in reasonable positions,
//      // so draw a line from the edge of the label to the pie
//      // slice to which it corresponds.
//      for ( int i = 0; i < sliceLabels.size(); i++ ) {
//        PNode label = sliceLabels.get( i );
//        Point2D labelConnectPt = new Point2D.Double();
//        if ( label.getFullBoundsReference().getCenterX() > pieChart.getFullBoundsReference().getCenterX() ) {
//          // Label is on right, so connect point should be on left.
//          labelConnectPt.setLocation(
//            label.getFullBoundsReference().getMinX(),
//            label.getFullBoundsReference().getCenterY() );
//        }
//        else {
//          // Label is on left, so connect point should be on right.
//          labelConnectPt.setLocation(
//            label.getFullBoundsReference().getMaxX(),
//            label.getFullBoundsReference().getCenterY() );
//        }
//        Point2D sliceConnectPt = pieChart.getCenterEdgePtForSlice( i );
//        assert sliceConnectPt != null; // Should be a valid slice edge point for each label.
//        // Find a point that is straight out from the center
//        // of the pie chart above the point that connects to
//        // the slice.  Note that these calculations assume
//        // that the center of the pie chart is at (0,0).
//        DoubleGeneralPath connectingLineShape = new DoubleGeneralPath( sliceConnectPt );
//        if ( sliceConnectPt.getY() > OVERALL_HEIGHT * 0.25 || sliceConnectPt.getY() < -OVERALL_HEIGHT * 0.25 ) {
//          // Add a "bend point" so that the line doesn't go
//          // under the pie chart.
//          double additionalLength = OVERALL_HEIGHT / PIE_CHART_DIAMETER - 1;
//          double scaleFactor = 1 - Math.min( Math.abs( sliceConnectPt.getX() ) / ( PIE_CHART_DIAMETER / 4.0 ), 1 );
//          Point2D bendPt = new Point2D.Double(
//            sliceConnectPt.getX() * ( 1 + additionalLength * scaleFactor ),
//            sliceConnectPt.getY() * ( 1 + additionalLength * scaleFactor ) );
//          connectingLineShape.lineTo( bendPt );
//        }
//        connectingLineShape.lineTo( labelConnectPt );
//        labelLayer.addChild( new PhetPPath( connectingLineShape.getGeneralPath(),
//          CONNECTING_LINE_STROKE, Color.BLACK ) );
//      }
//    }
//  }
//} );
//}
//
///**
// * Adjust the pie chart labels such that they do not overlap with one
// * another and yet are still within the overall bounds of the chart.
// *
// * @param sliceLabels
// */
//private void adjustLabelPositionsForOverlap( ArrayList<SliceLabel> sliceLabels, double minY, double maxY ) {
//  double rotationIncrement = Math.PI / 200; // Empirically chosen.
//  for ( int i = 1; i < 50; i++ ) { // Number of iterations empirically chosen.
//    boolean overlapDetected = false;
//    for ( SliceLabel label : sliceLabels ) {
//      boolean moveUp = false;
//      boolean moveDown = false;
//      for ( SliceLabel comparisonLabel : sliceLabels ) {
//        if ( label == comparisonLabel ) {
//          // Same label, so ignore.
//          continue;
//        }
//        if ( label.fullIntersects( comparisonLabel.getFullBoundsReference() ) ) {
//          // These labels overlap.
//          overlapDetected = true;
//          if ( label.getUnconstrainedPosRef().getY() > comparisonLabel.getUnconstrainedPosRef().getY() && label.getFullBoundsReference().getMaxY() < maxY ) {
//            moveUp = true;
//          }
//          else if ( label.getUnconstrainedPosRef().getY() < comparisonLabel.getUnconstrainedPosRef().getY() && label.getFullBoundsReference().getMinY() > minY ) {
//            moveDown = true;
//          }
//        }
//      }
//      // Adjust this label's position based upon any overlap that
//      // was detected.  The general idea is this: if there is
//      // overlap in both directions, don't move.  If there is only
//      // overlap with a label that has a higher unconstrained
//      // location, move down.  If there is only overlap with a label
//      // with a lower unconstrained location, move down.
//      if ( moveUp && !moveDown ) {
//        if ( isLabelOnRight( label ) ) {
//          MutableVector2D posVector = new MutableVector2D( label.getOffset().getX(), label.getOffset().getY() + label.getFullBoundsReference().height / 2 );
//          posVector.rotate( rotationIncrement );
//          label.setOffset( posVector.getX(), posVector.getY() - label.getFullBoundsReference().height / 2 );
//        }
//        else {
//          MutableVector2D posVector = new MutableVector2D( label.getFullBoundsReference().getMaxX(), label.getOffset().getY() + label.getFullBoundsReference().height / 2 );
//          posVector.rotate( -rotationIncrement );
//          label.setOffset( posVector.getX() - label.getFullBoundsReference().width, posVector.getY() - label.getFullBoundsReference().height / 2 );
//        }
//      }
//      else if ( moveDown && !moveUp ) {
//        if ( isLabelOnRight( label ) ) {
//          MutableVector2D posVector = new MutableVector2D( label.getOffset().getX(), label.getOffset().getY() + label.getFullBoundsReference().height / 2 );
//          posVector.rotate( -rotationIncrement );
//          label.setOffset( posVector.getX(), posVector.getY() - label.getFullBoundsReference().height / 2 );
//        }
//        else {
//          MutableVector2D posVector = new MutableVector2D( label.getFullBoundsReference().getMaxX(), label.getOffset().getY() + label.getFullBoundsReference().height / 2 );
//          posVector.rotate( rotationIncrement );
//          label.setOffset( posVector.getX() - label.getFullBoundsReference().width, posVector.getY() - label.getFullBoundsReference().height / 2 );
//        }
//      }
//    }
//    if ( !overlapDetected ) {
//      // No overlap for any of the labels, so we are done.
//      break;
//    }
//  }
//}
//
//private boolean isLabelOnRight( SliceLabel label ) {
//  return ( label.getFullBoundsReference().getCenterX() > 0 );
//}
//
///**
// * Class that represents the label for a slice, which consists of a
// * readout that shows the percentage for this slice and a label of the
// * isotope.
// */
//private static class SliceLabel extends PNode {
//  private static final Font READOUT_FONT = new PhetFont( 18 );
//
//  // The "unconstrained position" is the position where this label
//  // would be placed if it didn't need to sit within the upper and
//  // lower bounds of the pie chart and didn't have to worry about
//  // avoiding overlap with other labels.  It is used for arbitrating
//  // how labels move when handling overlap.
//  private final Point2D unconstrainedPos = new Point2D.Double( 0, 0 );
//
//  public SliceLabel( ImmutableAtom isotopeConfig, double isotopePercentage, int decimalDigitsToShow, boolean labelOnLeft ) {
//  final ChemSymbolWithNumbers symbol = new ChemSymbolWithNumbers( isotopeConfig );
//  addChild( symbol );
//  final PText readoutText = new PText( VariablePrecisionNumberFormat.format( isotopePercentage,
//      Math.min( 4,//limit to 4 decimal points to be consistent with the front panel (and to protect the user from too many digits), even though we may know higher precision
//        decimalDigitsToShow )
//    ) + " %" ) {{
//  setFont( READOUT_FONT );
//}};
//PNode readoutBox = new PhetPPath( Color.WHITE, new BasicStroke( 1 ), Color.BLACK ) {{
//  Shape readoutBoxShape = new RoundRectangle2D.Double( 0, 0, readoutText.getFullBoundsReference().width * 1.2,
//    readoutText.getFullBoundsReference().height * 1.1, 4, 4 );
//  setPathTo( readoutBoxShape );
//  readoutText.centerFullBoundsOnPoint( getFullBoundsReference().getCenterX(), getFullBoundsReference().getCenterY() );
//  addChild( readoutText );
//}};
//// Make the two portions of the label line up on the horizontal
//// axis.
//if ( symbol.getFullBoundsReference().height > readoutBox.getFullBoundsReference().height ) {
//  readoutBox.setOffset(
//    readoutBox.getOffset().getX(),
//    symbol.getFullBoundsReference().getCenterY() - readoutBox.getFullBoundsReference().height / 2 );
//}
//else {
//  symbol.setOffset(
//    symbol.getOffset().getX(),
//    readoutBox.getFullBoundsReference().getCenterY() - symbol.getFullBoundsReference().height / 2 );
//}
//// Position the elements of the overall label.
//addChild( readoutBox );
//if ( labelOnLeft ) {
//  readoutBox.setOffset( symbol.getFullBoundsReference().getMaxX() + 5, readoutBox.getOffset().getY() );
//}
//else {
//  symbol.setOffset( readoutBox.getFullBoundsReference().getMaxX() + 5, symbol.getOffset().getY() );
//}
//}
//
//protected void setUnconstrainedPos( double x, double y ) {
//  unconstrainedPos.setLocation( x, y );
//}
//
//protected Point2D getUnconstrainedPosRef() {
//  return unconstrainedPos;
//}
//}
//
///**
// * Class that represents a chemical symbol, including the mass number
// * (in front of the chemical symbol and partially above it) and the
// * atomic number (in front of the chemical symbol and partially below
// * it).
// */
//private static class ChemSymbolWithNumbers extends PNode {
//  private static final Font CHEMICAL_SYMBOL_FONT = new PhetFont( 16 );
//  private static final Font SUPERSCRIPT_SUBSCRIPT_FONT = new PhetFont( 14 );
//  private static final double DISTANCE_FROM_NUMBERS_TO_SYMBOL = 2; // In screen coords, close to pixels.
//
//  public ChemSymbolWithNumbers( ImmutableAtom chemical ) {
//  final PText massNumber = new PText( Integer.toString( chemical.getMassNumber() ) ) {{
//  setFont( SUPERSCRIPT_SUBSCRIPT_FONT );
//  setOffset( 0, 0 );
//}};
//addChild( massNumber );
//final PText symbol = new PText( chemical.getSymbol() ) {{
//  setFont( CHEMICAL_SYMBOL_FONT );
//  setOffset(
//    massNumber.getFullBoundsReference().getMaxX() + DISTANCE_FROM_NUMBERS_TO_SYMBOL,
//    massNumber.getFullBoundsReference().height * 0.4 );
//}};
//addChild( symbol );
//PText atomicNumber = new PText( Integer.toString( chemical.getNumProtons() ) ) {{
//  setFont( SUPERSCRIPT_SUBSCRIPT_FONT );
//  setOffset(
//    symbol.getFullBoundsReference().getMinX() - DISTANCE_FROM_NUMBERS_TO_SYMBOL - getFullBoundsReference().width,
//    symbol.getFullBoundsReference().getMaxY() - getFullBoundsReference().height * 0.6 );
//}};
//addChild( atomicNumber );
//}
//}
//
///**
// * Pie value that is used to create the pie chart node but that also
// * retains precision information, which is needed for correct display of
// * the pie slice labels.
// *
// * @author John Blanco
// */
//protected static class IsotopePieValue extends PieValue {
//
//  private final PrecisionDecimal precisionDecimal;
//  private final ImmutableAtom isotopeConfig;
//
//  /**
//   * Constructor.
//   */
//  protected IsotopePieValue( ImmutableAtom isotopeConfig, PrecisionDecimal precisionDecimal, Color color ) {
//  super( precisionDecimal.getPreciseValue(), color );
//    this.isotopeConfig = isotopeConfig;
//    this.precisionDecimal = precisionDecimal;
//}
//
//protected PrecisionDecimal getPrecisionDecimal() {
//  return precisionDecimal;
//}
//
//protected ImmutableAtom getIsotopeConfig() {
//  return isotopeConfig;
//}
//}
//}