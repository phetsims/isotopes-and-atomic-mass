// Copyright 2015-2025, University of Colorado Boulder

/**
 * Node that represents a pie chart with two slices and their labels positioned accordingly
 *
 * @author John Blanco
 * @author Aadish Gupta
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { toFixedNumber } from '../../../../dot/js/util/toFixedNumber.js';
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
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import Panel from '../../../../sun/js/Panel.js';
import PieChartNode, { PieSlice } from '../../common/view/PieChartNode.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';

// constants
const PIE_CHART_RADIUS = 36;
const FIRST_SLICE_COLOR = new Color( 'rgb( 134, 102, 172 )' );
const SECOND_SLICE_COLOR = new Color( '#d3d3d3' );
const TRACE_ABUNDANCE_IN_PIE_CHART = 1E-6; // empirically chosen value used to represent trace abundance in the pie chart
const ABUNDANCE_DECIMAL_PLACES = 4; // number of decimal places to show in abundance readout
const READOUT_TO_PIE_CHART_DISTANCE = 50; // distance between the abundance readout and the pie chart

// TODO: Should we use new patterns? https://github.com/phetsims/isotopes-and-atomic-mass/issues/112
const otherIsotopesPatternStringProperty = IsotopesAndAtomicMassStrings.otherIsotopesPatternStringProperty;
const thisIsotopeStringProperty = IsotopesAndAtomicMassStrings.thisIsotopeStringProperty;
const traceStringProperty = IsotopesAndAtomicMassStrings.traceStringProperty;

class TwoItemPieChartNode extends Node {

  public constructor( particleAtom: ParticleAtom ) {
    super();

    // Create a bounding rectangle for the pie chart.  This is needed because the pie chart can disappear if none of
    // its slices have a value greater than zero, which messes with layout.  The rectangle is invisible
    const pieChartBoundingRectangle = new Rectangle( 150, 0, PIE_CHART_RADIUS * 2, PIE_CHART_RADIUS * 2, 0, 0 );
    this.addChild( pieChartBoundingRectangle );

    // Create the default slices and color coding.  The first slice is for the user-created isotope, the second is for
    // all other isotopes that exist in nature (and are stable).
    const slices: PieSlice[] = [
      { value: 0, color: FIRST_SLICE_COLOR, stroke: Color.BLACK, lineWidth: 0.5 },
      { value: 0, color: SECOND_SLICE_COLOR, stroke: Color.BLACK, lineWidth: 0.5 }
    ];

    // Create the pie chart itself, centered in the bounding rectangle.
    const pieChart = new PieChartNode( slices, PIE_CHART_RADIUS );
    pieChart.setCenter( pieChartBoundingRectangle.center );
    pieChartBoundingRectangle.addChild( pieChart );

    // Create a derived property that will represent the abundance on Earth of the current isotope.
    const abundanceStringProperty = new DerivedProperty(
      [ particleAtom.protonCountProperty, particleAtom.neutronCountProperty, traceStringProperty ],
      protonCount => {
        if ( protonCount > 0 ) {
          const abundance = AtomIdentifier.getNaturalAbundance(
            particleAtom,
            ABUNDANCE_DECIMAL_PLACES + 2
          );
          if ( abundance === 0 && AtomIdentifier.existsInTraceAmounts( particleAtom ) ) {
            return traceStringProperty.value;
          }
          else {
            return toFixedNumber( abundance * 100, ABUNDANCE_DECIMAL_PLACES ) + '%';
          }
        }
        else {
          return '';
        }
      }
    );

    // Create the number display for the abundance of the current isotope.
    const abundanceDisplay = new Panel(
      new Text( abundanceStringProperty, { font: new PhetFont( 14 ), maxWidth: 100 } ),
      {
        align: 'center',
        lineWidth: 1.5,
        stroke: FIRST_SLICE_COLOR,
        cornerRadius: 5,
        xMargin: 4,
        yMargin: 4
      }
    );
    this.addChild( abundanceDisplay );

    const thisIsotopeLabel = new Text( thisIsotopeStringProperty, {
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

    // Align the number display and its connecting line when the number display changes.
    abundanceDisplay.localBoundsProperty.link( () => {
      abundanceDisplay.centerX = pieChartBoundingRectangle.left - READOUT_TO_PIE_CHART_DISTANCE;
      abundanceDisplay.centerY = pieChartBoundingRectangle.centerY;
      thisIsotopeLabel.centerX = abundanceDisplay.centerX;
      thisIsotopeLabel.bottom = abundanceDisplay.top - 5;
      leftConnectingLine.setLine(
        abundanceDisplay.left,
        abundanceDisplay.centerY,
        pieChartBoundingRectangle.centerX,
        pieChartBoundingRectangle.centerY
      );
    } );

    function updateOtherIsotopeLabel( isotope: TReadOnlyNumberAtom ): void {
      const abundanceTo6Digits = AtomIdentifier.getNaturalAbundance( isotope, 6 );
      const name = AtomIdentifier.getName( particleAtom.protonCountProperty.get() ).value;
      if ( particleAtom.protonCountProperty.get() > 0 && abundanceTo6Digits < 1 ) {

        // TODO: Handle legacy string pattern https://github.com/phetsims/isotopes-and-atomic-mass/issues/112
        otherIsotopeLabel.string = StringUtils.format( otherIsotopesPatternStringProperty.value, name );
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
      const thisIsotopeAbundanceTo6Digits = AtomIdentifier.getNaturalAbundance( particleAtom, 6 );
      const otherIsotopesAbundance = 1 - thisIsotopeAbundanceTo6Digits;

      // set the slice value for the current isotope
      if ( thisIsotopeAbundanceTo6Digits === 0 && AtomIdentifier.existsInTraceAmounts( particleAtom ) ) {
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
      updateOtherIsotopeLabel( particleAtom );
    }

    // Update the pie chart when the proton or neutron counts change.
    Multilink.multilink(
      [ particleAtom.protonCountProperty, particleAtom.neutronCountProperty ],
      protonCount => {
        if ( protonCount > 0 ) {
          updatePieChart();
          leftConnectingLine.visible = AtomIdentifier.getNaturalAbundance( particleAtom, ABUNDANCE_DECIMAL_PLACES ) > 0 ||
                                       AtomIdentifier.existsInTraceAmounts( particleAtom );
        }
      }
    );

    // do initial update to the pie chart
    updatePieChart();
  }
}

isotopesAndAtomicMass.register( 'TwoItemPieChartNode', TwoItemPieChartNode );
export default TwoItemPieChartNode;