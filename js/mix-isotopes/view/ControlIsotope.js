// Copyright 2015, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var ArrowButton = require( 'SCENERY_PHET/buttons/ArrowButton' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var IsotopeNode = require( 'SHRED/view/IsotopeNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Panel = require( 'SUN/Panel' );

  var READOUT_SIZE = new Dimension2( 40, 40 );

  /**
   * Constructor for an IsotopeAtomNode.
   *
   * @param {ParticleAtom} particleAtom Model that represents the atom, including particle positions
   * @param {NumberAtom} numberAtom Model that representa the atom as a collection of numbers
   * @param {Vector2} bottomPoint desired bottom point of the atom which holds the atom in position as the size changes.
   * @param {ModelViewTransform2} modelViewTransform Model-View transform
   * @constructor
   */
  function ControlIsotope( controller ) {

    Node.call( this ); // Call super constructor.
    var sliderLayer = new Node();
    this.addChild( sliderLayer );
    var labelLayer = new Node();
    this.addChild( labelLayer );
    var numericLayer = new Node();
    this.addChild( numericLayer );

    var valueProperty = new Property( 0 );
    var range = new Range( 0, 100 );
    var tickLabelOptions = { font: new PhetFont( 12 ) };
    var slider = new HSlider( valueProperty, range, {
      thumbSize: new Dimension2( 15, 30 ),
      majorTickLength: 15
      //trackSize: new Dimension2( 300, 5 )
      //center: layoutBounds.center
    } );

    // major ticks
    slider.addMajorTick( range.min, new Text( range.min, tickLabelOptions ) );
    slider.addMajorTick( range.max, new Text( range.max, tickLabelOptions ) );
    sliderLayer.addChild(slider);

    var plusButton = new ArrowButton( 'right', function propertyPlus() {
      valueProperty.set( Math.floor( valueProperty.get() ) + 1 ) ;
    } );
    var minusButton = new ArrowButton( 'left', function propertyMinus() {
      valueProperty.set( Math.floor( valueProperty.get() ) - 1 ) ;
    } );
    numericLayer.addChild(plusButton);
    numericLayer.addChild(minusButton);

    var isotopeText = new Text( '', { font: new PhetFont( 20 ), maxWidth: 0.9 * READOUT_SIZE.width, maxHeight: 0.9 * READOUT_SIZE.height } );

    var panel = new Panel( isotopeText, {
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
    //slider.left = minusButton.left;

    valueProperty.link( function changedValue( value ) {
      isotopeText.setText( Math.floor( value) );
      isotopeText.centerX = READOUT_SIZE.width / 2;
      isotopeText.centerY = READOUT_SIZE.height * 0.4;

      minusButton.enabled = !(Math.floor( value ) === 0);
      plusButton.enabled = !(Math.floor( value ) === 100);
    });


    var isotopeNode = new IsotopeNode( controller.controllerIsotope, 6, {
      showLabel: false
    });
    labelLayer.addChild( isotopeNode );
    var captionLabel = new Text( controller.caption, {
      font: new PhetFont( { size: 14 } ),
      fill: 'black',
      maxWidth: 60
    } );
    labelLayer.addChild( captionLabel );
    captionLabel.left = isotopeNode.right + 5;
    captionLabel.centerY = isotopeNode.centerY;
    //isotopeNode.centerY = captionLabel.centerY;
    labelLayer.bottom = sliderLayer.top - 5;
    numericLayer.bottom = labelLayer.top - 10;
    labelLayer.centerX = numericLayer.centerX;
    sliderLayer.centerX = numericLayer.centerX;
  }

  isotopesAndAtomicMass.register( 'ControlIsotope', ControlIsotope );
  // Inherit from Node.
  return inherit( Node, ControlIsotope );
} );