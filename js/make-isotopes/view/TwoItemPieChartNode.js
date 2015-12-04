// Copyright 2015, University of Colorado Boulder

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
  var MultiLineText = require( 'SCENERY_PHET/MultiLineText');
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PieChartNode = require( 'ISOTOPES_AND_ATOMIC_MASS/common/PieChartNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // constants
  var PIE_CHART_RADIUS = 60;
  var FIRST_SLICE_COLOR = ' rgb( 134, 102, 172 ) ';
  var SECOND_SLICE_COLOR = 'white';

  // strings
  var thisIsotopeString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/thisIsotope' );
  var otherString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/other' );
  var isotopesString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/isotopes' );

  /**
   * Constructor for an TwoItemPieChartNode.
   *
   * @param {makeIsotopesModel} makeIsotopesModel
   * @constructor
   */
  function TwoItemPieChartNode( makeIsotopesModel ) {

    Node.call( this );

    // TODO test cases for pie chart
    //var slices = [ { value:25, color:'red' } ];
    //var slices = [ { value:25, color:'red' }, { value:25, color:'blue' } ];
    //var slices = [ { value:75, color:'red' }, { value:25, color:'blue' } ];
    //var slices = [ { value:40, color:'red' }, { value:0, color:'blue' }, { value:30, color:'green' } ];

    var pieChartBoundingRectangle = new Rectangle( 150, 0, PIE_CHART_RADIUS * 2, PIE_CHART_RADIUS * 2, 0, 0 );

    // default slices and color coding, first slice is for my isotope and second slice is for other isotope
    var slices = [ { value:0, color:FIRST_SLICE_COLOR, stroke:'black', lineWidth: 0.5 },
      { value:0, color:SECOND_SLICE_COLOR, stroke:'black', lineWidth: 0.5 } ];

    var pieChart = new PieChartNode( slices, PIE_CHART_RADIUS );
    // center point of of bounding rectangle
    pieChart.setCenter( pieChartBoundingRectangle.width / 2 + 150, pieChartBoundingRectangle.height / 2 );
    pieChartBoundingRectangle.addChild( pieChart );

    function updatePieChart(){
      var myIsotopeAbundance = AtomIdentifier.getNaturalAbundance( makeIsotopesModel.particleAtom );
      var otherIsotopeAbundance = 1 - myIsotopeAbundance;
      slices[ 0 ].value = myIsotopeAbundance;
      slices[ 1 ].value = otherIsotopeAbundance;
      pieChart.setPieValues( slices );
      pieChart.setInitialAngle(  Math.PI * 2 * slices[ 1 ].value / ( slices[ 0 ].value + slices[ 1 ].value ) / 2 );
      updateReadout( myIsotopeAbundance );
      updateOtherIsotopeLabel(myIsotopeAbundance);
    }

    makeIsotopesModel.on( 'atomReconfigured', function() {
      updatePieChart();
    } );

    pieChartBoundingRectangle.scale(0.6);
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
      centerY: pieChartBoundingRectangle.centerY
    } );

    this.addChild( myIsotopeAbundancePanel );

    function updateReadout( myIsotopeAbundance ) {
      readoutMyIsotopeAbundanceText.text = ( Util.toFixedNumber( myIsotopeAbundance * 100, 4 ) ).toString() + '%';
      myIsotopeAbundancePanel.centerX = pieChartBoundingRectangle.left - 50; // empirically determined
      myIsotopeLabel.centerX = myIsotopeAbundancePanel.centerX;
      if (myIsotopeAbundance === 0){
        connectingLine.visible = false;
      }
      else {
        connectingLine.visible = true;
      }
    }

    var myIsotopeLabel = new Text( thisIsotopeString, {
      font: new PhetFont( { size: 12 } ),
      fill: 'black',
      maxWidth: 60
    } );
    myIsotopeLabel.bottom = myIsotopeAbundancePanel.top - 5;
    this.addChild( myIsotopeLabel );

    var connectingLine = new Line( myIsotopeAbundancePanel.centerX, myIsotopeAbundancePanel.centerY,
      pieChartBoundingRectangle.centerX, pieChartBoundingRectangle.centerY, {
      stroke: 'black',
      lineDash: [ 3, 1 ]
    });
    this.addChild( connectingLine );
    connectingLine.moveToBack();

    var otherIsotopeLabel = new MultiLineText( '', {
      font: new PhetFont( { size: 12 } ),
      fill: 'black',
      maxWidth: 60,
      align: 'center'
    } );

    // Attach otherIsotopeLabel with protonCountProperty to change element name on proton count change
    function updateOtherIsotopeLabel(myIsotopeAbundance) {
      var name = AtomIdentifier.getName( makeIsotopesModel.particleAtom.protonCount );
      if ( makeIsotopesModel.particleAtom.protonCount > 0 && myIsotopeAbundance < 1 ){
        otherIsotopeLabel.text = otherString + '\n' + name + '\n' + isotopesString;
      }
      else{
        otherIsotopeLabel.text = '';
      }
      otherIsotopeLabel.centerY = pieChartBoundingRectangle.centerY;
      otherIsotopeLabel.left = pieChartBoundingRectangle.right + 5;
    }

    this.addChild( otherIsotopeLabel );

    // do initial update to the pie chart
    updatePieChart();


  }

  isotopesAndAtomicMass.register( 'TwoItemPieChartNode', TwoItemPieChartNode );
  return inherit( Node, TwoItemPieChartNode, {
  } );

} );