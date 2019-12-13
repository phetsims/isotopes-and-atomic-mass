// Copyright 2015-2017, University of Colorado Boulder

/**
 * Node that represents a pie chart with two slice and there labels positioned accordingly
 *
 * @author John Blanco
 * @author Aadish Gupta
 */

define( function( require ) {
  'use strict';

  // modules
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var Line = require( 'SCENERY/nodes/Line' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PieChartNode = require( 'ISOTOPES_AND_ATOMIC_MASS/common/view/PieChartNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // constants
  var PIE_CHART_RADIUS = 60;
  var FIRST_SLICE_COLOR = ' rgb( 134, 102, 172 ) ';
  var SECOND_SLICE_COLOR = ' #d3d3d3';
  var TRACE_ABUNDANCE_IN_PIE_CHART = 1E-6; // empirically chosen value used to represent trace abundance in the pie chart

  // strings
  var otherIsotopesPatternString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/otherIsotopesPattern' );
  var thisIsotopeString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/thisIsotope' );
  var traceString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/trace' );

  /**
   * Constructor for an TwoItemPieChartNode.
   *
   * @param {MakeIsotopesModel} makeIsotopesModel
   * @constructor
   */
  function TwoItemPieChartNode( makeIsotopesModel ) {

    Node.call( this );

    var pieChartBoundingRectangle = new Rectangle( 150, 0, PIE_CHART_RADIUS * 2, PIE_CHART_RADIUS * 2, 0, 0 );

    // default slices and color coding, first slice is for my isotope and second slice is for other isotope
    var slices = [ { value: 0, color: FIRST_SLICE_COLOR, stroke: 'black', lineWidth: 0.5 },
      { value: 0, color: SECOND_SLICE_COLOR, stroke: 'black', lineWidth: 0.5 }
    ];

    var pieChart = new PieChartNode( slices, PIE_CHART_RADIUS );
    // center point of of bounding rectangle
    pieChart.setCenter( pieChartBoundingRectangle.width / 2 + 150, pieChartBoundingRectangle.height / 2 );
    pieChartBoundingRectangle.addChild( pieChart );

    function updatePieChart() {
      var thisIsotopeAbundanceTo6Digits = AtomIdentifier.getNaturalAbundance( makeIsotopesModel.particleAtom, 6 );
      var otherIsotopesAbundance = 1 - thisIsotopeAbundanceTo6Digits;

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
    var readoutMyIsotopeAbundanceText = new Text( '', {
      font: new PhetFont( 14 ),
      maxWidth: 80
    } );

    var thisIsotopeAbundancePanel = new Panel( readoutMyIsotopeAbundanceText, {
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
      var thisIsotopeAbundanceTo6Digits = AtomIdentifier.getNaturalAbundance( isotope, 6 );
      var existsInTraceAmounts = AtomIdentifier.existsInTraceAmounts( isotope );
      if ( thisIsotopeAbundanceTo6Digits === 0 && existsInTraceAmounts ) {
        readoutMyIsotopeAbundanceText.text = traceString;
      }
      else {
        readoutMyIsotopeAbundanceText.text = ( Util.toFixedNumber( thisIsotopeAbundanceTo6Digits * 100, 6 ) ).toString() + '%';
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

    var otherIsotopeLabel = new RichText( '', {
      font: new PhetFont( { size: 12 } ),
      fill: 'black',
      maxWidth: 60,
      align: 'center'
    } );

    // Attach otherIsotopeLabel with protonCountProperty to change element name on proton count change
    function updateOtherIsotopeLabel( isotope ) {
      var abundanceTo6Digits = AtomIdentifier.getNaturalAbundance( isotope, 6 );
      var name = AtomIdentifier.getName( makeIsotopesModel.particleAtom.protonCountProperty.get() );
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

