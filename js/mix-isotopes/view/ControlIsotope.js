// Copyright 2015-2020, University of Colorado Boulder


import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import inherit from '../../../../phet-core/js/inherit.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import IsotopeNode from '../../../../shred/js/view/IsotopeNode.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';

const READOUT_SIZE = new Dimension2( 30, 15 );

/**
 * @param {Property.<number>} controller
 * @param {number} minRange
 * @param {number} maxRange
 * @constructor
 */
function ControlIsotope( controller, minRange, maxRange ) {
  Node.call( this ); // Call super constructor.
  const sliderLayer = new Node();
  this.addChild( sliderLayer );
  const labelLayer = new Node();
  this.addChild( labelLayer );
  const numericLayer = new Node();
  this.addChild( numericLayer );

  const range = new Range( minRange, maxRange );
  const tickLabelOptions = { font: new PhetFont( 12 ), pickable: false };
  const slider = new HSlider( controller.quantityProperty, range, {
    trackSize: new Dimension2( 80, 5 ),
    thumbSize: new Dimension2( 15, 30 ),
    thumbTouchAreaXDilation: 8,
    thumbTouchAreaYDilation: 8,
    majorTickLength: 15,
    tickLabelSpacing: 0
  } );

  // major ticks
  slider.addMajorTick( range.min, new Text( range.min, tickLabelOptions ) );
  slider.addMajorTick( range.max, new Text( range.max, tickLabelOptions ) );
  sliderLayer.addChild( slider );

  const plusButton = new ArrowButton( 'right', function propertyPlus() {
    controller.quantityProperty.set( Math.floor( controller.quantityProperty.get() ) + 1 );
  }, { arrowHeight: 10, arrowWidth: 10 } );
  const minusButton = new ArrowButton( 'left', function propertyMinus() {
    controller.quantityProperty.set( Math.floor( controller.quantityProperty.get() ) - 1 );
  }, { arrowHeight: 10, arrowWidth: 10 } );
  numericLayer.addChild( plusButton );
  numericLayer.addChild( minusButton );

  const isotopeText = new Text( '', {
    font: new PhetFont( 20 ),
    maxWidth: 0.9 * READOUT_SIZE.width,
    maxHeight: 0.9 * READOUT_SIZE.height
  } );

  const panel = new Panel( isotopeText, {
    minWidth: READOUT_SIZE.width,
    minHeight: READOUT_SIZE.height,
    resize: false,
    cornerRadius: 5,
    lineWidth: 1,
    align: 'center'

  } );

  numericLayer.addChild( panel );
  plusButton.left = panel.right + 5;
  minusButton.right = panel.left - 5;
  plusButton.centerY = panel.centerY;
  minusButton.centerY = panel.centerY;
  //slider.left = minusButton.left;

  const changedValue = function( value ) {
    isotopeText.setText( Math.floor( value ) );
    isotopeText.centerX = READOUT_SIZE.width / 2;
    isotopeText.centerY = READOUT_SIZE.height * 0.75;

    minusButton.enabled = !( Math.floor( value ) === minRange );
    plusButton.enabled = !( Math.floor( value ) === maxRange );
    controller.setIsotopeQuantity( Math.floor( value ) );
  };

  controller.quantityProperty.link( changedValue );

  const isotopeNode = new IsotopeNode( controller.controllerIsotope, 6, {
    showLabel: false
  } );
  labelLayer.addChild( isotopeNode );
  const captionLabel = new Text( controller.caption, {
    font: new PhetFont( { size: 14 } ),
    fill: 'black',
    maxWidth: 60
  } );
  labelLayer.addChild( captionLabel );
  captionLabel.left = isotopeNode.right + 5;
  captionLabel.centerY = isotopeNode.centerY;
  labelLayer.bottom = sliderLayer.top - 5;
  numericLayer.bottom = labelLayer.top - 10;
  labelLayer.centerX = numericLayer.centerX;
  sliderLayer.centerX = numericLayer.centerX + 5;

  this.disposeControlIsotope = function() {
    controller.quantityProperty.unlink( changedValue );
  };
}

isotopesAndAtomicMass.register( 'ControlIsotope', ControlIsotope );

inherit( Node, ControlIsotope, {
  dispose: function() {
    this.disposeControlIsotope();
    Node.prototype.dispose.call( this );
  }
} );

export default ControlIsotope;