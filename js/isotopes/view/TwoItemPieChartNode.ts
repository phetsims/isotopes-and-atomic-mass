// Copyright 2015-2026, University of Colorado Boulder

/**
 * TwoItemPieChartNode represents a pie chart with two slices and their labels. The first slice represents the abundance
 * of the current isotope, and the second slice represents the abundance of all other isotopes of the same element that
 * exist in nature (and are stable).
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Aadish Gupta
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { toFixedNumber } from '../../../../dot/js/util/toFixedNumber.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
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

// string Properties
const otherIsotopesPatternStringProperty = IsotopesAndAtomicMassStrings.otherIsotopesPatternStringProperty;
const thisIsotopeStringProperty = IsotopesAndAtomicMassStrings.thisIsotopeStringProperty;
const traceStringProperty = IsotopesAndAtomicMassStrings.traceStringProperty;

class TwoItemPieChartNode extends Node {

  public constructor( particleAtom: ParticleAtom ) {

    // Create the default slices and color coding.  The first slice is for the user-created isotope, the second is for
    // all other isotopes that exist in nature (and are stable).
    const slices: PieSlice[] = [
      { value: 1, color: FIRST_SLICE_COLOR, stroke: Color.BLACK, lineWidth: 0.5 },
      { value: 0, color: SECOND_SLICE_COLOR, stroke: Color.BLACK, lineWidth: 0.5 }
    ];

    // Create the pie chart.  Everything else in this node is laid out relative to this.  Using this approach allows the
    // pie chart to stay in the same place while the abundance readout and other isotope label are repositioned as
    // needed.
    const pieChart = new PieChartNode( slices, PIE_CHART_RADIUS );

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

    const thisIsotopeLabel = new Text( thisIsotopeStringProperty, {
      font: new PhetFont( { size: 12 } ),
      fill: 'black',
      maxWidth: 60
    } );

    // Create the dashed line that connects the abundance readout panel to the pie chart.  The initial size is
    // arbitrary, it will be updated when the readout panel is positioned.
    const leftConnectingLine = new Line( 0, 0, pieChart.centerX, 0, {
      stroke: FIRST_SLICE_COLOR,
      lineDash: [ 3, 1 ]
    } );

    // Create the string for the element name.  This has to be a dynamic property because the proton count can change
    // the selected element, but changing the locale can change that element's name.
    const emptyStringProperty = new StringProperty( '' );
    const elementNameProperty = new DerivedProperty(
      [ particleAtom.protonCountProperty ],
      protonCount => {
        if ( protonCount > 0 ) {
          return AtomIdentifier.getName( protonCount );
        }
        else {
          return emptyStringProperty;
        }
      }
    );
    const elementNameDynamicProperty: TReadOnlyProperty<string> = new DynamicProperty( elementNameProperty );

    // Create a derived property for the "other isotopes" label that depends on the element name and the string pattern.
    const otherIsotopesStringProperty = new DerivedProperty(
      [ elementNameDynamicProperty, otherIsotopesPatternStringProperty ],
      ( elementName: string, otherIsotopesPatternString ) => StringUtils.format( otherIsotopesPatternString, elementName )
    );

    const otherIsotopeLabel = new RichText( otherIsotopesStringProperty, {
      font: new PhetFont( { size: 12 } ),
      fill: 'black',
      maxWidth: 60,
      align: 'center'
    } );

    // Create the dashed line that connects the other isotope label to the pie chart.  The initial size is arbitrary, it
    // will be updated when the label is positioned.
    const rightConnectingLine = new Line( 0, 0, 10, 0, {
      stroke: SECOND_SLICE_COLOR,
      lineDash: [ 3, 1 ]
    } );

    // Align the number display and its connecting line when the number display changes.
    abundanceDisplay.localBoundsProperty.link( () => {
      abundanceDisplay.centerX = pieChart.left - READOUT_TO_PIE_CHART_DISTANCE;
      abundanceDisplay.centerY = pieChart.centerY;
      thisIsotopeLabel.centerX = abundanceDisplay.centerX;
      thisIsotopeLabel.bottom = abundanceDisplay.top - 5;
      leftConnectingLine.setLine(
        abundanceDisplay.left,
        abundanceDisplay.centerY,
        pieChart.centerX,
        pieChart.centerY
      );
    } );

    // Create a derived property that will determine whether the other isotopes label and its connecting line should be
    // visible.
    const otherIsotopesIndicatorVisibleProperty = new DerivedProperty(
      [ particleAtom.protonCountProperty, particleAtom.neutronCountProperty ],
      protonCount => {
        let visible = false;
        if ( protonCount > 0 ) {

          // If the abundance is less than 1, then we want to show the other isotopes label and connecting line.
          const abundanceTo6Digits = AtomIdentifier.getNaturalAbundance( particleAtom, 6 );
          visible = abundanceTo6Digits < 1;
        }
        return visible;
      }
    );

    // Put the other isotope label and its connecting line in an HBox so that they will be laid out together.  The HBox
    // is positioned relative to the bounding rectangle.
    const otherIsotopesIndicator = new HBox( {
      spacing: 3,
      children: [
        rightConnectingLine,
        otherIsotopeLabel
      ],
      left: pieChart.right,
      centerY: pieChart.centerY,
      visibleProperty: otherIsotopesIndicatorVisibleProperty
    } );

    // Update the pie chart when the proton or neutron counts change, or when the string pattern changes.
    Multilink.multilink(
      [ particleAtom.protonCountProperty, particleAtom.neutronCountProperty, otherIsotopesPatternStringProperty ],
      protonCount => {

        if ( protonCount > 0 ) {

          const thisIsotopeAbundanceTo6Digits = AtomIdentifier.getNaturalAbundance( particleAtom, 6 );
          const otherIsotopesAbundance = 1 - thisIsotopeAbundanceTo6Digits;

          // Set the slice value for the current isotope.
          if ( thisIsotopeAbundanceTo6Digits === 0 && AtomIdentifier.existsInTraceAmounts( particleAtom ) ) {
            slices[ 0 ].value = TRACE_ABUNDANCE_IN_PIE_CHART;
          }
          else {
            slices[ 0 ].value = thisIsotopeAbundanceTo6Digits;
          }

          // Set up the slice value for all other isotopes.
          slices[ 1 ].value = otherIsotopesAbundance;
        }
        else {

          // This condition (i.e. where the proton count is zero) should only exist as a transient state, so the values
          // assigned here are essentially arbitrary.
          slices[ 0 ].value = 1;
          slices[ 1 ].value = 0;
        }

        // Update the pie chart.
        pieChart.setAngleAndValues(
          Math.PI * 2 * slices[ 1 ].value / ( slices[ 0 ].value + slices[ 1 ].value ) / 2,
          slices
        );

        leftConnectingLine.visible = slices[ 0 ].value > 0;
      }
    );

    super( {
      children: [
        leftConnectingLine,
        abundanceDisplay,
        thisIsotopeLabel,
        otherIsotopesIndicator,
        pieChart
      ]
    } );
  }
}

isotopesAndAtomicMass.register( 'TwoItemPieChartNode', TwoItemPieChartNode );
export default TwoItemPieChartNode;