// Copyright 2015, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var ArrowButton = require( 'SCENERY_PHET/buttons/ArrowButton' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var Carousel = require( 'SUN/Carousel' );
  var CheckBox = require( 'SUN/CheckBox' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var DemosView = require( 'SUN/demo/DemosView' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PageControl = require( 'SUN/PageControl' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );
  var sun = require( 'SUN/sun' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Panel = require( 'SUN/Panel' );

  var READOUT_SIZE = new Dimension2( 80, 50 );

  /**
   * Constructor for an IsotopeAtomNode.
   *
   * @param {ParticleAtom} particleAtom Model that represents the atom, including particle positions
   * @param {NumberAtom} numberAtom Model that representa the atom as a collection of numbers
   * @param {Vector2} bottomPoint desired bottom point of the atom which holds the atom in position as the size changes.
   * @param {ModelViewTransform2} modelViewTransform Model-View transform
   * @constructor
   */
  function ControlIsotope(  ) {

    Node.call( this ); // Call super constructor.
    var valueProperty = new Property( 0 );
    var range = new Range( 0, 100 );
    var tickLabelOptions = { font: new PhetFont( 12 ) };
    var slider = new HSlider( valueProperty, range, {
      thumbSize: new Dimension2( 15, 30 ),
      //trackSize: new Dimension2( 300, 5 )
      //center: layoutBounds.center
    } );

    // major ticks
    slider.addMajorTick( range.min, new Text( range.min, tickLabelOptions ) );
    slider.addMajorTick( range.max, new Text( range.max, tickLabelOptions ) );

    var plusButton = new ArrowButton( 'right', function propertyPlus() {
      valueProperty.set( Math.floor( valueProperty.get() ) + 1 ) ;
    } );
    var minusButton = new ArrowButton( 'left', function propertyMinus() {
      valueProperty.set( Math.floor( valueProperty.get() ) - 1 ) ;
    } );


    this.addChild(plusButton);
    this.addChild(minusButton);
    this.addChild(slider);
    plusButton.left = slider.right;
    minusButton.right = slider.left;

    var isotopeText = new Text( '', { font: new PhetFont( 20 ), maxWidth: 0.9 * READOUT_SIZE.width, maxHeight: 0.9 * READOUT_SIZE.height } );

    var panel = new Panel( isotopeText, {
      minWidth: READOUT_SIZE.width,
      minHeight: READOUT_SIZE.height,
      resize: false,
      cornerRadius: 5,
      lineWidth: 3,
      align: 'center'

    } );

    this.addChild( panel );

    valueProperty.link( function changedValue( value ) {
      isotopeText.setText( Math.floor( value) );
      isotopeText.centerX = READOUT_SIZE.width / 2;
      isotopeText.centerY = READOUT_SIZE.height * 0.325;

      minusButton.enabled = !(Math.floor( value ) === 0);
      plusButton.enabled = !(Math.floor( value ) === 100);
    })

  }

  isotopesAndAtomicMass.register( 'ControlIsotope', ControlIsotope );
  // Inherit from Node.
  return inherit( Node, ControlIsotope );
} );