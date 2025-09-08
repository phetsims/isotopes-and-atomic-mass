// Copyright 2015-2025, University of Colorado Boulder

/**
 * Node that represents a pie chart with two slices and their labels positioned accordingly
 *
 * @author John Blanco
 * @author Aadish Gupta
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import { TReadOnlyNumberAtom } from '../../../../shred/js/model/NumberAtom.js';
import Panel from '../../../../sun/js/Panel.js';
import PieChartNode, { PieSlice } from '../../common/view/PieChartNode.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';
import MakeIsotopesModel from '../model/MakeIsotopesModel.js';

// constants
const PIE_CHART_RADIUS = 60;
const FIRST_SLICE_COLOR = new Color( 'rgb( 134, 102, 172 )' );
const SECOND_SLICE_COLOR = new Color( '#d3d3d3' );
const TRACE_ABUNDANCE_IN_PIE_CHART = 1E-6; // empirically chosen value used to represent trace abundance in the pie chart

const otherIsotopesPatternString = IsotopesAndAtomicMassStrings.otherIsotopesPattern;
const thisIsotopeString = IsotopesAndAtomicMassStrings.thisIsotope;
const traceString = IsotopesAndAtomicMassStrings.trace;

class TwoItemPieChartNode extends Node {

  public constructor( makeIsotopesModel: MakeIsotopesModel ) {
    super();

    const pieChartBoundingRectangle = new Rectangle( 150, 0, PIE_CHART_RADIUS * 2, PIE_CHART_RADIUS * 2, 0, 0 );

    // Create the default slices and color coding.  The first slice is for the user-created isotope, the second is for
    // all other isotopes that exist in nature (and are stable).
    const slices: PieSlice[] = [
      { value: 0, color: FIRST_SLICE_COLOR, stroke: Color.BLACK, lineWidth: 0.5 },
      { value: 0, color: SECOND_SLICE_COLOR, stroke: Color.BLACK, lineWidth: 0.5 }
    ];

    const pieChart = new PieChartNode( slices, PIE_CHART_RADIUS );

    // center point of bounding rectangle
    pieChart.setCenter( new Vector2( pieChartBoundingRectangle.width / 2 + 150, pieChartBoundingRectangle.height / 2 ) );
    pieChartBoundingRectangle.addChild( pieChart );

    const readoutMyIsotopeAbundanceText = new Text( '', {
      font: new PhetFont( 14 ),
      maxWidth: 80
    } );

    const thisIsotopeAbundancePanel = new Panel( readoutMyIsotopeAbundanceText, {
      minWidth: 60,
      minHeight: 20,
      resize: true,
      cornerRadius: 5,
      lineWidth: 1.5,
      align: 'center',
      stroke: FIRST_SLICE_COLOR,
      centerY: pieChartBoundingRectangle.centerY
    } );

    this.addChild( thisIsotopeAbundancePanel );

    const thisIsotopeLabel = new Text( thisIsotopeString, {
      font: new PhetFont( { size: 12 } ),
      fill: 'black',
      maxWidth: 60
    } );
    this.addChild( thisIsotopeLabel );

    // Create the dashed line that connects the abundance readout panel to the pie chart.  The initial size is
    // arbitrary, it will be updated when the readout panel is positioned.
    const leftConnectingLine = new Line( 0, 0, pieChartBoundingRectangle.centerX, 0, {
      stroke: FIRST_SLICE_COLOR,
      lineDash: [ 3, 1 ]
    } );
    this.addChild( leftConnectingLine );
    leftConnectingLine.moveToBack();

    const otherIsotopeLabel = new RichText( '', {
      font: new PhetFont( { size: 12 } ),
      fill: 'black',
      maxWidth: 60,
      align: 'center'
    } );
    this.addChild( otherIsotopeLabel );

    // Create the dashed line that connects the other isotope label to the pie chart.  The initial size is arbitrary, it
    // will be updated when the label is positioned.
    const rightConnectingLine = new Line( 0, 0, 20, 0, {
      stroke: SECOND_SLICE_COLOR,
      lineDash: [ 3, 1 ]
    } );
    this.addChild( rightConnectingLine );
    rightConnectingLine.moveToBack();

    function updateThisIsotopeAbundanceReadout( isotope: TReadOnlyNumberAtom ): void {
      const thisIsotopeAbundanceTo6Digits = AtomIdentifier.getNaturalAbundance( isotope, 6 );
      const existsInTraceAmounts = AtomIdentifier.existsInTraceAmounts( isotope );
      if ( thisIsotopeAbundanceTo6Digits === 0 && existsInTraceAmounts ) {
        readoutMyIsotopeAbundanceText.string = traceString;
      }
      else {
        readoutMyIsotopeAbundanceText.string = `${Utils.toFixedNumber( thisIsotopeAbundanceTo6Digits * 100, 6 )}%`;
      }
      thisIsotopeAbundancePanel.centerX = pieChartBoundingRectangle.left - 50; // empirically determined
      thisIsotopeAbundancePanel.centerY = pieChartBoundingRectangle.centerY;
      thisIsotopeLabel.centerX = thisIsotopeAbundancePanel.centerX;
      thisIsotopeLabel.bottom = thisIsotopeAbundancePanel.top - 5;
      leftConnectingLine.setLine(
        thisIsotopeAbundancePanel.centerX,
        thisIsotopeAbundancePanel.centerY,
        pieChartBoundingRectangle.centerX,
        pieChartBoundingRectangle.centerY
      );
      leftConnectingLine.visible = thisIsotopeAbundanceTo6Digits > 0 || existsInTraceAmounts;
    }

    function updateOtherIsotopeLabel( isotope: TReadOnlyNumberAtom ): void {
      const abundanceTo6Digits = AtomIdentifier.getNaturalAbundance( isotope, 6 );
      const name = AtomIdentifier.getName( makeIsotopesModel.particleAtom.protonCountProperty.get() ).value;
      if ( makeIsotopesModel.particleAtom.protonCountProperty.get() > 0 && abundanceTo6Digits < 1 ) {
        otherIsotopeLabel.string = StringUtils.format( otherIsotopesPatternString, name );
        otherIsotopeLabel.visible = true;
        rightConnectingLine.visible = true;
      }
      else {
        otherIsotopeLabel.visible = false;
        rightConnectingLine.visible = false;
      }
      otherIsotopeLabel.centerY = pieChartBoundingRectangle.centerY;
      otherIsotopeLabel.left = pieChartBoundingRectangle.right + 10;
      rightConnectingLine.setLine(
        otherIsotopeLabel.left - 2,
        pieChartBoundingRectangle.centerY,
        pieChartBoundingRectangle.centerX,
        pieChartBoundingRectangle.centerY
      );
    }

    function updatePieChart(): void {
      const thisIsotopeAbundanceTo6Digits = AtomIdentifier.getNaturalAbundance( makeIsotopesModel.particleAtom, 6 );
      const otherIsotopesAbundance = 1 - thisIsotopeAbundanceTo6Digits;

      // set the slice value for the current isotope
      if ( thisIsotopeAbundanceTo6Digits === 0 && AtomIdentifier.existsInTraceAmounts( makeIsotopesModel.particleAtom ) ) {
        slices[ 0 ].value = TRACE_ABUNDANCE_IN_PIE_CHART;
      }
      else {
        slices[ 0 ].value = thisIsotopeAbundanceTo6Digits;
      }

      // set up the slice value for all other isotopes
      slices[ 1 ].value = otherIsotopesAbundance;

      // update the pie and the labels
      pieChart.setAngleAndValues(
        Math.PI * 2 * slices[ 1 ].value / ( slices[ 0 ].value + slices[ 1 ].value ) / 2,
        slices
      );
      updateThisIsotopeAbundanceReadout( makeIsotopesModel.particleAtom );
      updateOtherIsotopeLabel( makeIsotopesModel.particleAtom );
    }

    // No call to off() required since this exists for the lifetime of the sim
    makeIsotopesModel.atomReconfigured.addListener( (): void => {
      updatePieChart();
    } );

    pieChartBoundingRectangle.scale( 0.6 );
    this.addChild( pieChartBoundingRectangle );

    // do initial update to the pie chart
    updatePieChart();
  }
}

isotopesAndAtomicMass.register( 'TwoItemPieChartNode', TwoItemPieChartNode );
export default TwoItemPieChartNode;