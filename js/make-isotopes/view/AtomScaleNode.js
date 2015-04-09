// Copyright 2002-2014, University of Colorado Boulder

/**
 * Node that represents a scale on which an atom can be weighed.  This node is intended to have a faux 3D look to it,
 * but is not truly 3D in any way.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Color = require( 'SCENERY/util/Color' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Property = require( 'AXON/Property' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  // class data
  var DISPLAY_MODE = { MASS_NUMBER: "mass number", ATOMIC_MASS: "atomic mass" };
  var COLOR = new Color( 228, 194, 167 );
  var SIZE = new Dimension2( 320, 125 );
  var WEIGH_PLATE_WIDTH = SIZE.width * 0.70;
//  var STROKE = new BasicStroke( 2, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND );
  var STROKE_PAINT = Color.BLACK;

  /**
   * Class that defines the readout on the front of the scale.  This readout can display an atom's mass as either the
   * mass number, which is an integer number representing the total number of nucleons, or as the atomic mass, which is
   * the relative actual mass of the atom.
   *
   * @param {NumberAtom} atom
   * @param {Property} displayModeProperty
   * @constructor
   *
   * @author John Blanco
   * @author Jesse Greenberg
   */
  function ScaleReadoutNode( atom, displayModeProperty ) {

    this.atom = atom;

    var readoutBackground = new Rectangle( 0, 0, SIZE.width * 0.4, SIZE.height * 0.33, 5, 5, {
      fill: Color.WHITE,
      lineWidth: 2,
      stroke: Color.BLACK
    } );

    var readoutText = new Text( '', { font: new PhetFont( 24 ) } );
    readoutText.setCenter( readoutBackground.getCenter() );

    // Add the text that will appear in the readout.
    readoutBackground.addChild( readoutText );

    // Watch the property that represents the display mode and update the readout when it changes.
    displayModeProperty.link( function() {
      updateReadout();
    } );

    // Watch the atom and update the readout whenever it changes.
    atom.massNumberProperty.link( function() {
      updateReadout();
    } );

    function updateReadout() {

      if ( displayModeProperty.get() === DISPLAY_MODE.MASS_NUMBER ) {
        readoutText.setText( atom.massNumber.toString() );
      }

      else {
        var isotopeAtomicMass = atom.getIsotopeAtomicMass();
        readoutText.setText( isotopeAtomicMass > 0 ? isotopeAtomicMass.toFixed( 5 ) : "--" );
      }

      // Make sure that the text fits in the display.
      readoutText.scale( 1 );
      if ( readoutText.width > readoutBackground.rectWidth || readoutText.height > readoutBackground.rectHeight ) {
        var scaleFactor = Math.min( readoutBackground.rectWidth / readoutText.width, readoutBackground.rectHeight / readoutText.height );
        readoutText.scale( scaleFactor );
      }

      // Center the text in the display.
      readoutText.setCenter( new Vector2( readoutBackground.rectWidth / 2, readoutBackground.rectHeight / 2 ) );

    }

    return readoutBackground;
  }

  /**
   * This object contains the radio buttons that allow the user to select the display mode for the scale.
   *
   * @constructor
   * @author John Blanco
   * @author Jesse Greenberg
   */
  function DisplayModeSelectionNode( displayModeProperty ) {

    var LABEL_FONT = new PhetFont( 16 );

    var radioButtonContent = [
      { value: DISPLAY_MODE.MASS_NUMBER, node: new Text( 'Mass Number', { font: LABEL_FONT } ) },
      { value: DISPLAY_MODE.ATOMIC_MASS, node: new Text( 'Atomic Mass (amu)', { font: LABEL_FONT } ) }
    ];

    var radioButtonGroup = new RadioButtonGroup( displayModeProperty, radioButtonContent, {
      orientation: 'vertical',
      selectedLineWidth: 2,
      deselectedLineWidth: 0,
      spacing: 1
    } );

    return new Panel( radioButtonGroup, {
      lineWidth: 0,
      fill: COLOR,
      yMargin: 0
    } );

  }

  /**
   * Constructor for an AtomScaleNode.
   *
   * @param {atom} atom
   * @constructor
   */
  function AtomScaleNode( atom ) {

    Node.call( this );

    this.displayModeProperty = new Property( DISPLAY_MODE.MASS_NUMBER );

    // Set up some helper variables.
    var centerX = SIZE.width / 2;
    // NOTE: The scale shapes are generated from the bottom up, since adding them in this order creates the correct
    // layering effect.

    // Add the front of the scale base.
    var frontOfBaseNode = new Rectangle( 0, SIZE.height * 0.55, SIZE.width, SIZE.height * 0.5, {
      fill: COLOR,
      lineWidth: 2,
      stroke: STROKE_PAINT
    } );
    this.addChild( frontOfBaseNode );

    // Add the scale readout node which displays either atomic mass or number.
    var scaleReadoutNode = new ScaleReadoutNode( atom, this.displayModeProperty );
    scaleReadoutNode.setLeftCenter( new Vector2( SIZE.width * 0.05, frontOfBaseNode.centerY ) );
    this.addChild( scaleReadoutNode );

    // Add the display mode selector to the scale base.
    var displayModeSelectionNode = new DisplayModeSelectionNode( this.displayModeProperty );
    // Position the selector next to the readout.
    displayModeSelectionNode.setLeftCenter( new Vector2( scaleReadoutNode.getRight() + 5, frontOfBaseNode.centerY ) );
    this.addChild( displayModeSelectionNode );

    // Add the top portion of the scale base.  This is meant to look like a tilted rectangle.  Because, hey, it's all a
    // matter of perspective.
    var scaleBaseTopShape = new Shape();
    scaleBaseTopShape.moveTo( SIZE.width * 0.15, SIZE.height * 0.375 );
    scaleBaseTopShape.lineTo( SIZE.width * 0.85, SIZE.height * 0.375 );
    scaleBaseTopShape.lineTo( SIZE.width, SIZE.height * 0.55 );
    scaleBaseTopShape.lineTo( 0, SIZE.height * 0.55 );
    scaleBaseTopShape.close();
    // Create the color gradient for the top of the base.
    var scaleBaseTopPaint = new LinearGradient( 0, scaleBaseTopShape.bounds.minY, 0, scaleBaseTopShape.bounds.maxY );
    scaleBaseTopPaint.addColorStop( 0, '#78675A' ).addColorStop( 0.5, COLOR ).addColorStop( 1, '#E8D7CA' );
    var scaleBaseTop = new Path( scaleBaseTopShape, {
      lineWidth: 2,
      lineJoin: 'bevel',
      stroke: Color.BLACK,
      fill: scaleBaseTopPaint
    } );
    this.addChild( scaleBaseTop );

    // Add the shaft that connects the base to the weigh plate.
    var connectingShaftShape = new Shape();
    var connectingShaftDistanceFromTop = SIZE.height * 0.15;
    var connectingShaftWidth = SIZE.width * 0.1;
    var connectingShaftHeight = SIZE.height * 0.30;
    connectingShaftShape.moveTo( centerX - connectingShaftWidth / 2, connectingShaftDistanceFromTop );
    connectingShaftShape.lineTo( centerX - connectingShaftWidth / 2, connectingShaftDistanceFromTop + connectingShaftHeight );
    connectingShaftShape.quadraticCurveTo( centerX, connectingShaftDistanceFromTop + connectingShaftHeight * 1.2, SIZE.width / 2 + connectingShaftWidth / 2, connectingShaftDistanceFromTop + connectingShaftHeight );
    connectingShaftShape.lineTo( centerX + connectingShaftWidth / 2, connectingShaftDistanceFromTop );
    connectingShaftShape.close();

    // Create the color gradient for the shaft fill.
    var connectingShaftPaint = new LinearGradient( connectingShaftShape.bounds.minX, 0, connectingShaftShape.bounds.maxX, 0 );
    connectingShaftPaint.addColorStop( 0, '#EBDACD' ).addColorStop( 0.5, COLOR ).addColorStop( 1, '#78685B' );
    var connectingShaft = new Path( connectingShaftShape, {
      lineWidth: 2,
      lineJoin: 'bevel',
      stroke: Color.BLACK,
      fill: connectingShaftPaint
    } );
    this.addChild( connectingShaft );

    // Draw the top of the weigh plate.  This is meant to look like a tilted rectangle.
    var weighPlateTopShape = new Shape();
    weighPlateTopShape.moveTo( centerX - WEIGH_PLATE_WIDTH * 0.35, 0 );
    weighPlateTopShape.lineTo( centerX + WEIGH_PLATE_WIDTH * 0.35, 0 );
    weighPlateTopShape.lineTo( centerX + WEIGH_PLATE_WIDTH / 2, SIZE.height * 0.125 );
    weighPlateTopShape.lineTo( centerX - WEIGH_PLATE_WIDTH / 2, SIZE.height * 0.125 );
    weighPlateTopShape.close();
    // Create the color gradient for the weigh plate top.
    var weighPlateTopPaint = new LinearGradient( 0, weighPlateTopShape.bounds.minY, 0, weighPlateTopShape.bounds.maxY );
    weighPlateTopPaint.addColorStop( 0, '#BBA28D' ).addColorStop( 0.5, COLOR ).addColorStop( 1, '#EBD9CB' );
    this.weighPlateTop = new Path( weighPlateTopShape, {
      lineWidth: 2,
      lineJoin: 'bevel',
      stroke: Color.BLACK,
      fill: weighPlateTopPaint
    } );
    this.addChild( this.weighPlateTop );

    // Add the front of the weigh plate.
    var frontOfWeighPlateShape = new Rectangle( centerX - WEIGH_PLATE_WIDTH / 2, SIZE.height * 0.125, WEIGH_PLATE_WIDTH, SIZE.height * 0.15, {
      lineWidth: 2,
      fill: COLOR,
      stroke: Color.BLACK
    } );
    this.addChild( frontOfWeighPlateShape );
  }

  return inherit( Node, AtomScaleNode, {

    /**
     * Reset the atom scale node to its initial state by resetting the display mode property.
     */
    reset: function() {
      this.displayModeProperty.reset();
    },

    /**
     * Get the height of the weigh plate top.  This should be the very top of this node.
     * TODO: See if you can just use the top of this node to make weighPlate a private variable.
     *
     * @returns {number}
     */
    getWeighPlateTopProjectedHeight: function() {
      return this.weighPlateTop.getHeight();
    }

  } );

} );