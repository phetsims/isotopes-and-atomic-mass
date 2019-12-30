// Copyright 2015-2019, University of Colorado Boulder

/**
 * Node that represents a pie chart with two slice and there labels positioned accordingly
 *
 * @author John Blanco
 * @author Aadish Gupta
 */

define( require => {
  'use strict';

  // modules
  const AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  const inherit = require( 'PHET_CORE/inherit' );
  const isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const PieChartNode = require( 'ISOTOPES_AND_ATOMIC_MASS/common/view/PieChartNode' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );

  // constants
  const PIE_CHART_RADIUS = 60;
  const FIRST_SLICE_COLOR = ' rgb( 134, 102, 172 ) ';
  const SECOND_SLICE_COLOR = ' #d3d3d3';
  const TRACE_ABUNDANCE_IN_PIE_CHART = 1E-6; // empirically chosen value used to represent trace abundance in the pie chart

  // strings
  const otherIsotopesPatternString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/otherIsotopesPattern' );
  const thisIsotopeString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/thisIsotope' );
  const traceString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/trace' );

  /**
   * Constructor for an TwoItemPieChartNode.
   *
   * @param {MakeIsotopesModel} makeIsotopesModel
   * @constructor
   */
  function TwoItemPieChartNode( makeIsotopesModel ) {

    Node.call( this );

    const pieChartBoundingRectangle = new Rectangle( 150, 0, PIE_CHART_RADIUS * 2, PIE_CHART_RADIUS * 2, 0, 0 );

    // default slices and color coding, first slice is for my isotope and second slice is for other isotope
    const slices = [ { value: 0, color: FIRST_SLICE_COLOR, stroke: 'black', lineWidth: 0.5 },
      { value: 0, color: SECOND_SLICE_COLOR, stroke: 'black', lineWidth: 0.5 }
    ];

    const pieChart = new PieChartNode( slices, PIE_CHART_RADIUS );
    // center point of of bounding rectangle
    pieChart.setCenter( pieChartBoundingRectangle.width / 2 + 150, pieChartBoundingRectangle.height / 2 );
    pieChartBoundingRectangle.addChild( pieChart );

    function updatePieChart() {
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
    makeIsotopesModel.atomReconfigured.addListener( function() {
      updatePieChart();
    } );

    pieChartBoundingRectangle.scale( 0.6 );
    this.addChild( pieChartBoundingRectangle );

    // create the readout that will display the abundance in terms of percentage
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

    function updateThisIsotopeAbundanceReadout( isotope ) {
      const thisIsotopeAbundanceTo6Digits = AtomIdentifier.getNaturalAbundance( isotope, 6 );
      const existsInTraceAmounts = AtomIdentifier.existsInTraceAmounts( isotope );
      if ( thisIsotopeAbundanceTo6Digits === 0 && existsInTraceAmounts ) {
        readoutMyIsotopeAbundanceText.text = traceString;
      }
      else {
        readoutMyIsotopeAbundanceText.text = ( Utils.toFixedNumber( thisIsotopeAbundanceTo6Digits * 100, 6 ) ).toString() + '%';
      }
      thisIsotopeAbundancePanel.centerX = pieChartBoundingRectangle.left - 50; // empirically determined
      thisIsotopeAbundancePanel.centerY = pieChartBoundingRectangle.centerY;
      thisIsotopeLabel.centerX = thisIsotopeAbundancePanel.centerX;
      leftConnectingLine.visible = thisIsotopeAbundanceTo6Digits > 0 || existsInTraceAmounts;
    }

    var thisIsotopeLabel = new Text( thisIsotopeString, {
      font: new PhetFont( { size: 12 } ),
      fill: 'black',
      maxWidth: 60
    } );
    thisIsotopeLabel.bottom = thisIsotopeAbundancePanel.top - 5;
    this.addChild( thisIsotopeLabel );

    var leftConnectingLine = new Line( thisIsotopeAbundancePanel.centerX, thisIsotopeAbundancePanel.centerY,
      pieChartBoundingRectangle.centerX, pieChartBoundingRectangle.centerY, {
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

    // Attach otherIsotopeLabel with protonCountProperty to change element name on proton count change
    function updateOtherIsotopeLabel( isotope ) {
      const abundanceTo6Digits = AtomIdentifier.getNaturalAbundance( isotope, 6 );
      const name = AtomIdentifier.getName( makeIsotopesModel.particleAtom.protonCountProperty.get() );
      if ( makeIsotopesModel.particleAtom.protonCountProperty.get() > 0 && abundanceTo6Digits < 1 ) {
        otherIsotopeLabel.text = StringUtils.format( otherIsotopesPatternString, name );
        otherIsotopeLabel.visible = true;
        rightConnectingLine.visible = true;
      } else {
        otherIsotopeLabel.visible = false;
        rightConnectingLine.visible = false;
      }
      otherIsotopeLabel.centerY = pieChartBoundingRectangle.centerY;
      otherIsotopeLabel.left = pieChartBoundingRectangle.right + 10;
      rightConnectingLine.right = otherIsotopeLabel.left;
    }

    this.addChild( otherIsotopeLabel );

    var rightConnectingLine = new Line( pieChartBoundingRectangle.centerX, pieChartBoundingRectangle.centerY,
      pieChartBoundingRectangle.right + 20, pieChartBoundingRectangle.centerY, {
        stroke: SECOND_SLICE_COLOR,
        lineDash: [ 3, 1 ]
      } );
    this.addChild( rightConnectingLine );
    rightConnectingLine.moveToBack();

    // do initial update to the pie chart
    updatePieChart();
  }

  isotopesAndAtomicMass.register( 'TwoItemPieChartNode', TwoItemPieChartNode );
  return inherit( Node, TwoItemPieChartNode, {} );

} );

