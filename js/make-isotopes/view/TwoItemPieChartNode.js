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
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText' );
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

  // strings
  var otherIsotopesPatternString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/otherIsotopesPattern' );
  var thisIsotopeString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/thisIsotope' );

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
      var myIsotopeAbundance = AtomIdentifier.getNaturalAbundance( makeIsotopesModel.particleAtom );
      var otherIsotopeAbundance = 1 - myIsotopeAbundance;
      slices[ 0 ].value = myIsotopeAbundance;
      slices[ 1 ].value = otherIsotopeAbundance;
      pieChart.setAngleAndValues( Math.PI * 2 * slices[ 1 ].value / ( slices[ 0 ].value + slices[ 1 ].value ) / 2,
        slices );
      updateReadout( myIsotopeAbundance );
      updateOtherIsotopeLabel( myIsotopeAbundance );
    }

    // No call to off() required since this exists for the lifetime of the sim
    makeIsotopesModel.atomReconfigured.addListener( function() {
      updatePieChart();
    } );

    pieChartBoundingRectangle.scale( 0.6 );
    this.addChild( pieChartBoundingRectangle );

    var readoutMyIsotopeAbundanceText = new Text( '', {
      font: new PhetFont( 14 )
    } );

    var myIsotopeAbundancePanel = new Panel( readoutMyIsotopeAbundanceText, {
      minWidth: 60,
      minHeight: 20,
      resize: true,
      cornerRadius: 5,
      lineWidth: 1.5,
      align: 'center',
      stroke: FIRST_SLICE_COLOR,
      centerY: pieChartBoundingRectangle.centerY
    } );

    this.addChild( myIsotopeAbundancePanel );

    function updateReadout( myIsotopeAbundance ) {
      readoutMyIsotopeAbundanceText.text = ( Util.toFixedNumber( myIsotopeAbundance * 100, 4 ) ).toString() + '%';
      myIsotopeAbundancePanel.centerX = pieChartBoundingRectangle.left - 50; // empirically determined
      myIsotopeLabel.centerX = myIsotopeAbundancePanel.centerX;
      if ( myIsotopeAbundance === 0 ) {
        leftConnectingLine.visible = false;
      } else {
        leftConnectingLine.visible = true;
      }
    }

    var myIsotopeLabel = new Text( thisIsotopeString, {
      font: new PhetFont( { size: 12 } ),
      fill: 'black',
      maxWidth: 60
    } );
    myIsotopeLabel.bottom = myIsotopeAbundancePanel.top - 5;
    this.addChild( myIsotopeLabel );

    var leftConnectingLine = new Line( myIsotopeAbundancePanel.centerX, myIsotopeAbundancePanel.centerY,
      pieChartBoundingRectangle.centerX, pieChartBoundingRectangle.centerY, {
        stroke: FIRST_SLICE_COLOR,
        lineDash: [ 3, 1 ]
      } );
    this.addChild( leftConnectingLine );
    leftConnectingLine.moveToBack();

    var otherIsotopeLabel = new MultiLineText( '', {
      font: new PhetFont( { size: 12 } ),
      fill: 'black',
      maxWidth: 60,
      align: 'center'
    } );

    // Attach otherIsotopeLabel with protonCountProperty to change element name on proton count change
    function updateOtherIsotopeLabel( myIsotopeAbundance ) {
      var name = AtomIdentifier.getName( makeIsotopesModel.particleAtom.protonCountProperty.get() );
      if ( makeIsotopesModel.particleAtom.protonCountProperty.get() > 0 && myIsotopeAbundance < 1 ) {
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

