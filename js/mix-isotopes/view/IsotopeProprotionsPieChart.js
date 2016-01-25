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
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PieChartNode = require( 'ISOTOPES_AND_ATOMIC_MASS/common/view/PieChartNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var PIE_CHART_RADIUS = 40;
  var OVERALL_HEIGHT = 120;
  var READOUT_FONT = new PhetFont( 18 );
  var SIZE = new Dimension2( 90, 20 );
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
    Node.call( this );
    var labelLayer = new Node();
    this.addChild( labelLayer );
    var pieChartBoundingRectangle = new Rectangle( -OVERALL_HEIGHT / 2, -OVERALL_HEIGHT / 2, OVERALL_HEIGHT, OVERALL_HEIGHT, 0, 0);
    var emptyCircle = new Circle( PIE_CHART_RADIUS, { stroke: 'black', lineDash: [ 3, 1 ] } );
    emptyCircle.centerX = 0;
    emptyCircle.centerY = 0;
    pieChartBoundingRectangle.addChild( emptyCircle );


    // default slices this will be updated based on possible isotopes
    var slices = [ ];
    var sliceLabels = [ ];
    var pieChart = new PieChartNode( slices, PIE_CHART_RADIUS );
    pieChartBoundingRectangle.addChild( pieChart );

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
            if ( label === comparisonLabel ) {
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
          var posVector;
          if ( moveUp && !moveDown ) {
            if ( label.labelOnLeft ) {
              posVector = new Vector2( label.right, label.centerY + label.height / 2 );
              posVector.rotate( -rotationIncrement );
              label.centerX = posVector.x - label.width;
              label.centerY = posVector.y - label.height / 2;

            }
            else {
              posVector = new Vector2( label.centerX, label.centerY + label.height / 2 );
              posVector.rotate( rotationIncrement );
              label.centerX = posVector.x;
              label.centerY = posVector.y - label.height / 2;
            }
          }
          else if ( moveDown && !moveUp ) {
            if ( label.labelOnLeft ) {
              posVector = new Vector2( label.right, label.centerY + label.height / 2 );
              posVector.rotate( rotationIncrement );
              label.centerX = posVector.x - label.width;
              label.centerY = posVector.y - label.height / 2;

            }
            else {
              posVector = new Vector2( label.centerX, label.centerY + label.height / 2 );
              posVector.rotate( -rotationIncrement );
              label.centerX = posVector.x;
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
          var labelNode = new SliceLabelNode( isotope, proportion * 100, labelOnLeft, numberOfDecimals );

          // Determine the "unconstrained" target position
          // for the label, meaning a position that is
          // directly out from the edge of the slice, but
          // may be above or below the edges of the pie
          // chart.
          var posVector = centerEdgeOfPieSlice;
          var positionVector = posVector.times( 1.4 );
          labelNode.unconstrainedPos = positionVector;
          //labelNode.setUnconstrainedPos( positionVector.getX(), positionVector.getY() );

          // Constrain the position so that no part of the
          // label goes above or below the upper and lower
          // edges of the pie chart.
          var minY = -OVERALL_HEIGHT / 2 + labelNode.height / 2;
          var maxY = OVERALL_HEIGHT / 2 - labelNode.height / 2;
          var xSign = labelOnLeft ? -1 : 1;
          if ( positionVector.y < minY ) {
            positionVector.x = xSign * Math.sqrt( positionVector.magnitudeSquared() - minY * minY );
            positionVector.y = minY;
          }
          else if ( positionVector.y > maxY ) {
            positionVector.x = xSign * Math.sqrt( positionVector.magnitudeSquared() - maxY * maxY );
            positionVector.y = maxY;
          }

          // Position the label.
          if ( labelOnLeft ) {
            labelNode.centerX = positionVector.x - labelNode.width / 2;
            labelNode.centerY = positionVector.y;
          }
          else {
            // Label on right.
            labelNode.centerX = positionVector.x + labelNode.width / 2;
            labelNode.centerY = positionVector.y;
          }
          labelLayer.addChild( labelNode );
          sliceLabels.push( labelNode );
        }
        i = i + 1;
      } );
      adjustLabelPositionsForOverlap( sliceLabels, -OVERALL_HEIGHT / 2, OVERALL_HEIGHT / 2 );

      // The labels should now be all in reasonable positions,
      // so draw a line from the edge of the label to the pie
      // slice to which it corresponds.
      var j = 0;
      var k = 0;
      possibleIsotopes.forEach( function( isotope ) {
        var sliceConnectPt = pieChart.getCenterEdgePtForSlice( j );
        if ( sliceConnectPt ) {
          var label = sliceLabels[ k ];
          var labelConnectPt = new Vector2( 0, 0 );
          if ( label.centerX > pieChart.centerX ) {
            // Label is on right, so connect point should be on left.
            labelConnectPt.x = label.left;
            labelConnectPt.y = label.centerY;
          }
          else {
            // Label is on left, so connect point should be on right.
            labelConnectPt.x = label.right;
            labelConnectPt.y = label.centerY;
          }
          //assert sliceConnectPt != null; // Should be a valid slice edge point for each label.
          // Find a point that is straight out from the center
          // of the pie chart above the point that connects to
          // the slice.  Note that these calculations assume
          // that the center of the pie chart is at (0,0).
          var connectingLineShape = new Shape().moveTo( sliceConnectPt.x, sliceConnectPt.y );
          if ( sliceConnectPt.y > OVERALL_HEIGHT * 0.25 || sliceConnectPt.y < -OVERALL_HEIGHT * 0.25 ) {
            // Add a "bend point" so that the line doesn't go
            // under the pie chart.
            var additionalLength = OVERALL_HEIGHT / ( PIE_CHART_RADIUS * 2 ) - 1;
            var scaleFactor = 1 - Math.min( Math.abs( sliceConnectPt.x ) /  ( PIE_CHART_RADIUS / 2.0 ), 1 );
            //var scaleFactor = 1;
            connectingLineShape.lineTo( sliceConnectPt.x * ( 1 + additionalLength * scaleFactor ),
              sliceConnectPt.y * ( 1 + additionalLength * scaleFactor ) );
          }
          connectingLineShape.lineTo( labelConnectPt.x, labelConnectPt.y );
          labelLayer.addChild( new Path( connectingLineShape, {
            stroke: 'black',
            lineWidth: 1
          } ) );
          k = k + 1;
        }
        j = j + 1;
        });
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