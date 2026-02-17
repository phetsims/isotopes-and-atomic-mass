// Copyright 2016-2026, University of Colorado Boulder

/**
 * Class that represents a pie chart portraying the proportion of the various isotopes in the test chamber.
 *
 * @author Aadish Gupta
 *
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { toFixedNumber } from '../../../../dot/js/util/toFixedNumber.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Panel from '../../../../sun/js/Panel.js';
import PieChartNode, { PieSlice } from '../../common/view/PieChartNode.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import getIsotopeColor from '../model/getIsotopeColor.js';
import MixturesModel from '../model/MixturesModel.js';
import NucleusConfig from '../model/NucleusConfig.js';

// constants
const PIE_CHART_RADIUS = 40;
const OVERALL_HEIGHT = 120;
const READOUT_FONT = new PhetFont( 18 );
const SIZE = new Dimension2( 90, 20 );
const CHEMICAL_SYMBOL_FONT = new PhetFont( 16 );
const SUPERSCRIPT_SUBSCRIPT_FONT = new PhetFont( 14 );
const NUMBER_DECIMALS = 4;

function chemSymbolWithNumbersNode( isotopeConfig: NucleusConfig ): Node {
  const node = new Node();

  const symbol = new Text( AtomIdentifier.getSymbol( isotopeConfig.protonCount ), {
    font: CHEMICAL_SYMBOL_FONT,
    centerX: 0,
    centerY: 0
  } );
  node.addChild( symbol );

  const massNumber = new Text( isotopeConfig.getMassNumber().toString(), {
    font: SUPERSCRIPT_SUBSCRIPT_FONT,
    centerY: symbol.top
  } );
  massNumber.right = symbol.left;
  node.addChild( massNumber );

  const atomicNumber = new Text( isotopeConfig.protonCount.toString(), {
    font: SUPERSCRIPT_SUBSCRIPT_FONT,
    centerY: symbol.bottom
  } );
  atomicNumber.right = symbol.left;
  node.addChild( atomicNumber );

  return node;
}

class SliceLabelNode extends Node {
  public constructor( public unconstrainedPos: Vector2, public labelOnLeft: boolean ) {
    super();
  }
}

function sliceLabelNode(
  isotopeConfig: NucleusConfig,
  isotopePercentage: number,
  labelOnLeft: boolean,
  numberOfDecimals: number
): SliceLabelNode {
  const node = new SliceLabelNode( new Vector2( 0, 0 ), labelOnLeft );

  const symbol = chemSymbolWithNumbersNode( isotopeConfig );
  node.addChild( symbol );

  const readoutText = new Text( `${toFixedNumber( isotopePercentage, numberOfDecimals )}%`, {
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

  if ( symbol.height > readoutPanel.height ) {
    readoutPanel.centerY = symbol.centerY;
  }
  else {
    symbol.centerY = readoutPanel.centerY;
  }

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

  private readonly model: MixturesModel;
  private readonly labelLayer: Node;
  private readonly pieChartBoundingRectangle: Rectangle;
  private readonly emptyCircle: Circle;
  private slices: PieSlice[];
  private sliceLabels: SliceLabelNode[];
  private readonly pieChart: PieChartNode;

  /**
   * @param model - MixturesModel instance
   */
  public constructor( model: MixturesModel ) {
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

    this.slices = [];
    this.sliceLabels = [];
    this.pieChart = new PieChartNode( this.slices, PIE_CHART_RADIUS );
    this.pieChartBoundingRectangle.addChild( this.pieChart );

    this.addChild( this.pieChartBoundingRectangle );
  }

  /**
   * Update the complete node based on isotopeCount
   */
  public update(): void {
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
   */
  public updatePieChart(): void {
    this.slices = [];
    let i = 0;
    this.model.possibleIsotopesProperty.get().forEach( isotope => {
      const value = this.model.testChamber.getIsotopeCount( isotope );
      const color = getIsotopeColor( isotope.protonCount, isotope.neutronCount );
      this.slices[ i ] = { value: value, color: color, stroke: Color.BLACK, lineWidth: 0.5 };
      i += 1;
    } );
    const lightestIsotopeProportion = this.slices[ 0 ].value / this.model.testChamber.isotopeCountProperty.get();
    this.pieChart.setAngleAndValues( Math.PI - ( lightestIsotopeProportion * Math.PI ), this.slices );
    this.updateLabels( this.model.possibleIsotopesProperty.get() );
  }

  /**
   * Update the labels that correspond to each slice of the pie chart.  This includes both the text of the label and its
   * position.  The position is determined by first finding a position that is directly out from the center of the pie
   * chart at the angle corresponding to the middle of the slice, and then adjusting that position so that the label
   * doesn't overlap with the pie chart and so that labels don't overlap with each other.
   */
  private updateLabels( possibleIsotopes: NucleusConfig[] ): void {
    this.labelLayer.removeAllChildren();
    this.sliceLabels = [];
    let i = 0;
    possibleIsotopes.forEach( isotope => {
      let proportion: number;
      if ( this.model.showingNaturesMixProperty.get() ) {
        proportion = AtomIdentifier.getNaturalAbundance( isotope.toNumberAtom(), NUMBER_DECIMALS + 2 );
      }
      else {
        proportion = this.model.testChamber.getIsotopeProportion( isotope );
      }

      const centerEdgeOfPieSlice = this.pieChart.getCenterEdgePtForSlice( i );
      if ( centerEdgeOfPieSlice ) {
        const labelOnLeft = centerEdgeOfPieSlice.x <= this.pieChart.centerXCord;
        const numberOfDecimals = this.model.showingNaturesMixProperty.get() ? NUMBER_DECIMALS : 1;
        const labelNode = sliceLabelNode( isotope, proportion * 100, labelOnLeft, numberOfDecimals );

        // Determine the "unconstrained" target position for the label, meaning a position that is directly out from the
        // edge of the slice, but may be above or below the edges of the pie chart.
        const positionVector = centerEdgeOfPieSlice.times( 1.6 );
        labelNode.unconstrainedPos.x = positionVector.x;
        labelNode.unconstrainedPos.y = positionVector.y;

        // Constrain the position so that no part of the label goes above or below the upper and lower edges of the pie
        // chart.
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

        // Position the label node.
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

    // The labels should now be all in reasonable positions, so draw a line from the edge of the label to the pie slice
    // to which it corresponds.
    let j = 0;
    let k = 0;
    possibleIsotopes.forEach( () => {
      const sliceConnectPt = this.pieChart.getCenterEdgePtForSlice( j );
      if ( sliceConnectPt ) {
        const label = this.sliceLabels[ k ];
        const labelConnectPt = new Vector2( 0, 0 );
        if ( label.centerX > this.pieChart.centerX ) {

          // Label is on left, so connect point should be on right.
          labelConnectPt.x = label.left;
          labelConnectPt.y = label.centerY;
        }
        else {
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
          connectingLineShape.lineTo(
            sliceConnectPt.x * ( 1 + additionalLength * scaleFactor ),
            sliceConnectPt.y * ( 1 + additionalLength * scaleFactor )
          );
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
   * Adjust label positions to avoid overlap.
   * @param sliceLabels - Array of SliceLabelNode
   * @param minY - minimum y position
   * @param maxY - maximum y position
   */
  private adjustLabelPositionsForOverlap( sliceLabels: SliceLabelNode[], minY: number, maxY: number ): void {
    const rotationIncrement = Math.PI / 200;
    for ( let i = 1; i < 50; i++ ) {
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
        let posVector: Vector2;
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

        // No overlaps detected, so we're done.
        break;
      }
    }
  }
}

isotopesAndAtomicMass.register( 'IsotopeProportionsPieChart', IsotopeProportionsPieChart );

export default IsotopeProportionsPieChart;