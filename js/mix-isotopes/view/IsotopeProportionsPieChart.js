// Copyright 2016-2022, University of Colorado Boulder

/**
 * Class that represents a pie chart portraying the proportion of the various isotopes in the test chamber.
 *
 * @author Aadish Gupta
 *
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Circle, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Panel from '../../../../sun/js/Panel.js';
import PieChartNode from '../../common/view/PieChartNode.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

// constants
const PIE_CHART_RADIUS = 40;
const OVERALL_HEIGHT = 120;
const READOUT_FONT = new PhetFont( 18 );
const SIZE = new Dimension2( 90, 20 );
const CHEMICAL_SYMBOL_FONT = new PhetFont( 16 );
const SUPERSCRIPT_SUBSCRIPT_FONT = new PhetFont( 14 );
const NUMBER_DECIMALS = 4;

/**
 * Utility function to create a node which represents a chemical symbol, including the mass number(in front of the
 * chemical symbol and partially above it) and the atomic number (in front of the chemical symbol and partially below it).
 *
 * @param {NumberAtom} isotopeConfig
 */

function chemSymbolWithNumbersNode( isotopeConfig ) {
  const node = new Node();

  const symbol = new Text( AtomIdentifier.getSymbol( isotopeConfig.protonCountProperty.get() ), {
    font: CHEMICAL_SYMBOL_FONT,
    centerX: 0,
    centerY: 0
  } );
  node.addChild( symbol );

  const massNumber = new Text( isotopeConfig.massNumberProperty.get(), {
    font: SUPERSCRIPT_SUBSCRIPT_FONT,
    centerY: symbol.top
  } );
  massNumber.right = symbol.left;
  node.addChild( massNumber );

  const atomicNumber = new Text( isotopeConfig.protonCountProperty.get(), {
    font: SUPERSCRIPT_SUBSCRIPT_FONT,
    centerY: symbol.bottom
  } );
  atomicNumber.right = symbol.left;
  node.addChild( atomicNumber );

  return node;
}

/**
 * @param {NumberAtom} isotopeConfig
 * @param {number} isotopePercentage
 * @param {boolean} labelOnLeft
 * @param {number} numberOfDecimals
 */
function sliceLabelNode( isotopeConfig, isotopePercentage, labelOnLeft, numberOfDecimals ) {
  const node = new Node();

  // The "unconstrained position" is the position where this label would be placed if it didn't need to sit within the
  // upper and lower bounds of the pie chart and didn't have to worry about avoiding overlap with other labels.
  // It is used for arbitrating how labels move when handling overlap.
  node.unconstrainedPos = new Vector2( 0, 0 );

  node.labelOnLeft = labelOnLeft;
  const symbol = chemSymbolWithNumbersNode( isotopeConfig );
  node.addChild( symbol );

  const readoutText = new Text( `${Utils.toFixedNumber( isotopePercentage, numberOfDecimals )}%`, {
    font: READOUT_FONT,
    maxWidth: 0.9 * SIZE.width,
    maxHeight: 0.9 * SIZE.height
  } );

  const readoutPanel = new Panel( readoutText, {
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

class IsotopeProportionsPieChart extends Node {

  /**
   * @param {MixIsotopesModel} model
   */
  constructor( model ) {
    super();
    this.model = model;
    this.labelLayer = new Node();
    this.addChild( this.labelLayer );
    this.pieChartBoundingRectangle = new Rectangle( -OVERALL_HEIGHT / 2, -OVERALL_HEIGHT / 2,
      OVERALL_HEIGHT, OVERALL_HEIGHT, 0, 0 );
    this.emptyCircle = new Circle( PIE_CHART_RADIUS, { stroke: 'black', lineDash: [ 3, 1 ] } );
    this.emptyCircle.centerX = 0;
    this.emptyCircle.centerY = 0;
    this.pieChartBoundingRectangle.addChild( this.emptyCircle );

    // default slices this will be updated based on possible isotopes
    this.slices = [];
    this.sliceLabels = [];
    this.pieChart = new PieChartNode( this.slices, PIE_CHART_RADIUS );
    this.pieChartBoundingRectangle.addChild( this.pieChart );

    this.addChild( this.pieChartBoundingRectangle );
  }

  /**
   * Update the complete node based on isotopeCount
   * @public
   */
  update() {
    if ( this.model.testChamber.isotopeCountProperty.get() > 0 ) {
      this.emptyCircle.setVisible( false );
      this.updatePieChart();
      this.pieChart.setVisible( true );
      this.labelLayer.setVisible( true );
    }
    else {
      this.emptyCircle.setVisible( true );
      this.pieChart.setVisible( false );
      this.labelLayer.setVisible( false );
    }
  }

  /**
   * Update the pie chart
   * @public
   */
  updatePieChart() {
    this.slices = [];
    let i = 0;
    this.model.possibleIsotopesProperty.get().forEach( isotope => {
      const value = this.model.testChamber.getIsotopeCount( isotope );
      const color = this.model.getColorForIsotope( isotope );
      this.slices[ i ] = { value: value, color: color, stroke: 'black', lineWidth: 0.5 };
      i += 1;
    } );
    const lightestIsotopeProportion = this.slices[ 0 ].value / this.model.testChamber.isotopeCountProperty.get();
    this.pieChart.setAngleAndValues( Math.PI - ( lightestIsotopeProportion * Math.PI ), this.slices );
    this.updateLabels( this.model.possibleIsotopesProperty.get() );
  }

  /**
   * @param {Array.<Object>} possibleIsotopes
   * @private
   */
  updateLabels( possibleIsotopes ) {
    this.labelLayer.removeAllChildren();
    this.sliceLabels = [];
    let i = 0;
    possibleIsotopes.forEach( isotope => {
      let proportion;
      if ( this.model.showingNaturesMixProperty.get() ) {
        proportion = AtomIdentifier.getNaturalAbundance( isotope, NUMBER_DECIMALS + 2 ); // 2 more digits since % is used
      }
      else {
        proportion = this.model.testChamber.getIsotopeProportion( isotope );
      }

      const centerEdgeOfPieSlice = this.pieChart.getCenterEdgePtForSlice( i );
      if ( centerEdgeOfPieSlice ) {
        const labelOnLeft = centerEdgeOfPieSlice.x <= this.pieChart.centerXCord;
        const numberOfDecimals = this.model.showingNaturesMixProperty.get() ? NUMBER_DECIMALS : 1;
        const labelNode = sliceLabelNode( isotope, proportion * 100, labelOnLeft, numberOfDecimals );

        // Determine the "unconstrained" target position for the label, meaning a position that is directly out from
        // the edge of the slice, but may be above or below the edges of the pie chart.
        const posVector = centerEdgeOfPieSlice;
        const positionVector = posVector.times( 1.6 ); // empirically determined for positioning
        labelNode.unconstrainedPos.x = positionVector.x;
        labelNode.unconstrainedPos.y = positionVector.y;

        // Constrain the position so that no part of the label goes above or below the upper and lower edges
        // of the pie chart.
        const minY = -OVERALL_HEIGHT / 2 + labelNode.height / 2;
        const maxY = OVERALL_HEIGHT / 2 - labelNode.height / 2;
        const xSign = labelOnLeft ? -1 : 1;
        if ( positionVector.y < minY ) {
          positionVector.x = xSign * Math.sqrt( positionVector.magnitudeSquared - minY * minY );
          positionVector.y = minY;
        }
        else if ( positionVector.y > maxY ) {
          positionVector.x = xSign * Math.sqrt( positionVector.magnitudeSquared - maxY * maxY );
          positionVector.y = maxY;
        }
        labelNode.unconstrainedPos.x = positionVector.x;

        // Position the label.
        if ( labelOnLeft ) {
          labelNode.centerX = positionVector.x - labelNode.width / 2;
          labelNode.centerY = positionVector.y;
        }
        else {
          labelNode.centerX = positionVector.x + labelNode.width / 2;
          labelNode.centerY = positionVector.y;
        }
        this.labelLayer.addChild( labelNode );
        this.sliceLabels.push( labelNode );
      }
      i = i + 1;
    } );
    this.adjustLabelPositionsForOverlap( this.sliceLabels, -OVERALL_HEIGHT / 2, OVERALL_HEIGHT / 2 );

    // The labels should now be all in reasonable positions, so draw a line from the edge of the label to the pie
    // slice to which it corresponds.
    let j = 0;
    let k = 0;
    possibleIsotopes.forEach( isotope => {
      const sliceConnectPt = this.pieChart.getCenterEdgePtForSlice( j );
      if ( sliceConnectPt ) {
        const label = this.sliceLabels[ k ];
        const labelConnectPt = new Vector2( 0, 0 );
        if ( label.centerX > this.pieChart.centerX ) {
          // Label is on right, so connect point should be on left.
          labelConnectPt.x = label.left;
          labelConnectPt.y = label.centerY;
        }
        else {
          // Label is on left, so connect point should be on right.
          labelConnectPt.x = label.right;
          labelConnectPt.y = label.centerY;
        }
        // Find a point that is straight out from the center of the pie chart above the point that connects to the
        // slice. Note that these calculations assume that the center of the pie chart is at (0,0).
        const connectingLineShape = new Shape().moveTo( sliceConnectPt.x, sliceConnectPt.y );
        if ( sliceConnectPt.y > OVERALL_HEIGHT * 0.25 || sliceConnectPt.y < -OVERALL_HEIGHT * 0.25 ) {
          // Add a "bend point" so that the line doesn't go under the pie chart.
          const additionalLength = OVERALL_HEIGHT / ( PIE_CHART_RADIUS * 2 ) - 1;
          const scaleFactor = 1 - Math.min( Math.abs( sliceConnectPt.x ) / ( PIE_CHART_RADIUS / 2.0 ), 1 );
          connectingLineShape.lineTo( sliceConnectPt.x * ( 1 + additionalLength * scaleFactor ),
            sliceConnectPt.y * ( 1 + additionalLength * scaleFactor ) );
        }
        connectingLineShape.lineTo( labelConnectPt.x, labelConnectPt.y );
        this.labelLayer.addChild( new Path( connectingLineShape, {
          stroke: 'black',
          lineWidth: 1
        } ) );
        k = k + 1;
      }
      j = j + 1;
    } );
  }

  /**
   * @param {Array.<Object>} sliceLabels
   * @param {number} minY
   * @param {number} maxY
   * @private
   */
  adjustLabelPositionsForOverlap( sliceLabels, minY, maxY ) {
    const rotationIncrement = Math.PI / 200; // Empirically chosen.
    for ( let i = 1; i < 50; i++ ) { // Number of iterations empirically chosen.
      let overlapDetected = false;
      sliceLabels.forEach( label => {
        let moveUp = false;
        let moveDown = false;
        for ( let j = 0; j < sliceLabels.length; j++ ) {
          const comparisonLabel = sliceLabels[ j ];
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

        // Adjust this label's position based upon any overlap that was detected.  The general idea is this: if there
        // is overlap in both directions, don't move.  If there is only overlap with a label that has a higher
        // unconstrained position, move down.  If there is only overlap with a label with a lower unconstrained
        // position, move down.
        let posVector;
        if ( moveUp && !moveDown ) {
          if ( label.labelOnLeft ) {
            posVector = new Vector2( label.right, label.centerY + label.height / 2 );
            posVector.rotate( -rotationIncrement );
            label.centerX = posVector.x - label.width / 2;
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
            label.centerX = posVector.x - label.width / 2;
            label.centerY = posVector.y - label.height / 2;

          }
          else {
            posVector = new Vector2( label.centerX, label.centerY + label.height / 2 );
            posVector.rotate( -rotationIncrement );
            label.centerX = posVector.x;
            label.centerY = posVector.y - label.height / 2;
          }
        }
      } );
      if ( !overlapDetected ) {

        // No overlap was detected for any of the labels, so we're done.
        break;
      }
    }
  }
}

isotopesAndAtomicMass.register( 'IsotopeProportionsPieChart', IsotopeProportionsPieChart );

export default IsotopeProportionsPieChart;
