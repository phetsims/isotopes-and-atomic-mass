//  Copyright 2002-2014, University of Colorado Boulder

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
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Color = require( 'SCENERY/util/Color' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Property = require( 'AXON/Property' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // class data
  var DISPLAY_MODE = { MASS_NUMBER: "mass number", ATOMIC_MASS: "atomic mass" };
  var COLOR = new Color( 228, 194, 167 );
  var SIZE = new Dimension2( 320, 125 );
  var WEIGH_PLATE_WIDTH = SIZE.width * 0.70;
//  var STROKE = new BasicStroke( 2, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND );
  var STROKE_PAINT = Color.BLACK;

  /**
   * Constructor for an AtomScaleNode.
   *
   * @param {atom} atom -
   * @constructor
   */
  function AtomScaleNode( atom ) {

    Node.call( this );

    var displayModeProperty = new Property( DISPLAY_MODE.MASS_NUMBER );

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

    var scaleReadoutNode = new ScaleReadoutNode( atom, displayModeProperty );
    scaleReadoutNode.setLeftCenter( new Vector2( SIZE.width * 0.05, frontOfBaseNode.centerY ) );
    this.addChild( scaleReadoutNode );

  }

  return inherit( Node, AtomScaleNode, {

  } );


  /**
   * Class that defines the readout on the front of the scale.  This readout can display an atom's mass as either the
   * mass number, which is an integer number representing the total number of nucleons, or as the atomic mass, which is
   * the relative actual mass of the atom.
   *
   * @param {NumberAtom} atom
   * @param {Property} displayModProperty
   *
   * @author John Blanco
   * @author Jesse Greenberg
   */

  function ScaleReadoutNode( atom, displayModeProperty ) {

    this.atom = atom;
    this.displayModeProperty = displayModeProperty;

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
    this.displayModeProperty.link( function() {
      updateReadout();
    } );

//      // Watch the atom and update the readout whenever it changes.
//      atom.addAtomListener( new AtomListener.Adapter() {
//        @Override
//        public void configurationChanged() {
//          updateReadout();
//        }
//      } );

    function updateReadout() {

      if ( displayModeProperty.get() === DISPLAY_MODE.MASS_NUMBER ) {
        readoutText.setText( atom.massNumber.toString() );
      }
      else {
        var atomicMass = atom.getAtomicMass();
        readoutText.setText( atomicMass > 0 ? atomicMass.toFixed( 5 ) : "--" );
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

} );
//
//  // ------------------------------------------------------------------------
//  // Constructor(s)
//  // ------------------------------------------------------------------------
//

//
//    // Add the display mode selector to the scale base.
//    addChild( new DisplayModeSelectionNode( displayModeProperty ) {{
//      // Scale the selector if necessary.  This is here primarily in
//      // support of translation.
//      double maxAllowableWidth = frontOfBaseNode.getFullBoundsReference().getMaxX() - scaleReadoutNode.getFullBoundsReference().getMaxX() - 10;
//      if ( getFullBoundsReference().getWidth() > maxAllowableWidth ) {
//        setScale( maxAllowableWidth / getFullBoundsReference().width );
//      }
//      // Position the selector next to the readout.
//      setOffset( scaleReadoutNode.getFullBoundsReference().getMaxX() + 5,
//          frontOfBaseNode.getFullBoundsReference().getCenterY() - getFullBoundsReference().height / 2 );
//    }} );
//
//    // Add the top portion of the scale base.  This is meant to look like
//    // a tilted rectangle.  Because, hey, it's all a matter of
//    // perspective.
//    DoubleGeneralPath scaleBaseTopShape = new DoubleGeneralPath();
//    scaleBaseTopShape.moveTo( SIZE.getWidth() * 0.15, SIZE.getHeight() * 0.375 );
//    scaleBaseTopShape.lineTo( SIZE.getWidth() * 0.85, SIZE.getHeight() * 0.375 );
//    scaleBaseTopShape.lineTo( SIZE.getWidth(), SIZE.getHeight() * 0.55 );
//    scaleBaseTopShape.lineTo( 0, SIZE.getHeight() * 0.55 );
//    scaleBaseTopShape.closePath();
//    Rectangle2D scaleBaseTopShapeBounds = scaleBaseTopShape.getGeneralPath().getBounds2D();
//    GradientPaint scaleBaseTopPaint = new GradientPaint(
//      (float) scaleBaseTopShapeBounds.getCenterX(),
//      (float) scaleBaseTopShapeBounds.getMaxY(),
//      ColorUtils.brighterColor( COLOR, 0.5 ),
//      (float) scaleBaseTopShapeBounds.getCenterX(),
//      (float) scaleBaseTopShapeBounds.getMinY(),
//      ColorUtils.darkerColor( COLOR, 0.5 )
//  );
//    PNode scaleBaseTop = new PhetPPath( scaleBaseTopShape.getGeneralPath(), scaleBaseTopPaint, STROKE, STROKE_PAINT );
//    addChild( scaleBaseTop );
//
//    // Add the shaft that connects the base to the weigh plate.
//    DoubleGeneralPath connectingShaftShape = new DoubleGeneralPath();
//    double connectingShaftDistanceFromTop = SIZE.getHeight() * 0.15;
//    double connectingShaftWidth = SIZE.getWidth() * 0.1;
//    double connectingShaftHeight = SIZE.getHeight() * 0.30;
//    connectingShaftShape.moveTo( centerX - connectingShaftWidth / 2, connectingShaftDistanceFromTop );
//    connectingShaftShape.lineTo( centerX - connectingShaftWidth / 2, connectingShaftDistanceFromTop + connectingShaftHeight );
//    connectingShaftShape.quadTo( centerX, connectingShaftDistanceFromTop + connectingShaftHeight * 1.2, SIZE.getWidth() / 2 + connectingShaftWidth / 2, connectingShaftDistanceFromTop + connectingShaftHeight );
//    connectingShaftShape.lineTo( centerX + connectingShaftWidth / 2, connectingShaftDistanceFromTop );
//    Rectangle2D connectingShaftShapeBounds = connectingShaftShape.getGeneralPath().getBounds2D();
//    GradientPaint connectingShaftPaint = new GradientPaint(
//      (float) connectingShaftShapeBounds.getMinX(),
//      (float) connectingShaftShapeBounds.getCenterY(),
//      ColorUtils.brighterColor( COLOR, 0.5 ),
//      (float) connectingShaftShapeBounds.getMaxX(),
//      (float) connectingShaftShapeBounds.getCenterY(),
//      ColorUtils.darkerColor( COLOR, 0.5 ) );
//    PNode connectingShaft = new PhetPPath( connectingShaftShape.getGeneralPath(), connectingShaftPaint, STROKE, STROKE_PAINT );
//    addChild( connectingShaft );
//
//    // Draw the top of the weigh plate.  This is meant to look like a
//    // tilted rectangle.
//    DoubleGeneralPath weighPlateTopShape = new DoubleGeneralPath();
//    weighPlateTopShape.moveTo( centerX - WEIGH_PLATE_WIDTH * 0.35, 0 );
//    weighPlateTopShape.lineTo( centerX + WEIGH_PLATE_WIDTH * 0.35, 0 );
//    weighPlateTopShape.lineTo( centerX + WEIGH_PLATE_WIDTH / 2, SIZE.getHeight() * 0.125 );
//    weighPlateTopShape.lineTo( centerX - WEIGH_PLATE_WIDTH / 2, SIZE.getHeight() * 0.125 );
//    weighPlateTopShape.closePath();
//    Rectangle2D weighPlateTopShapeBounds = weighPlateTopShape.getGeneralPath().getBounds2D();
//    GradientPaint weighPlateTopPaint = new GradientPaint(
//      (float) weighPlateTopShapeBounds.getCenterX(),
//      (float) weighPlateTopShapeBounds.getMaxY(),
//      ColorUtils.brighterColor( COLOR, 0.5 ),
//      (float) weighPlateTopShapeBounds.getCenterX(),
//      (float) weighPlateTopShapeBounds.getMinY(),
//      ColorUtils.darkerColor( COLOR, 0.2 ) );
//    weighPlateTop = new PhetPPath( weighPlateTopShape.getGeneralPath(), weighPlateTopPaint, STROKE, STROKE_PAINT );
//    addChild( weighPlateTop );
//
//    // Add the front of the weigh plate.
//    Rectangle2D frontOfWeighPlateShape = new Rectangle2D.Double( centerX - WEIGH_PLATE_WIDTH / 2,
//        SIZE.getHeight() * 0.125, WEIGH_PLATE_WIDTH, SIZE.getHeight() * 0.15 );
//    addChild( new PhetPPath( frontOfWeighPlateShape, COLOR, STROKE, STROKE_PAINT ) );
//  }
//
//  // ------------------------------------------------------------------------
//  // Methods
//  // ------------------------------------------------------------------------
//
//  public void reset() {
//    displayModeProperty.reset();
//  }
//
//  public double getWeighPlateTopProjectedHeight() {
//    return weighPlateTop.getFullBoundsReference().getHeight();
//  }
//
//
//

//
//  /**
//   * This class represents a Piccolo node that contains the radio buttons
//   * that allows the user to select the display mode for the scale.
//   *
//   * @author John Blanco
//   */
//  public static class DisplayModeSelectionNode extends PNode {
//
//    private static final Font LABEL_FONT = new PhetFont( 16 );
//
//    public DisplayModeSelectionNode( Property<DisplayMode> displayModeProperty ) {
//      JPanel buttonPanel = new JPanel( new GridLayout( 2, 1 ) ) {{
//        setBackground( COLOR );
//      }};
//      PropertyRadioButton<DisplayMode> massNumberButton = new PropertyRadioButton<DisplayMode>( BuildAnAtomStrings.MASS_NUMBER, displayModeProperty, DisplayMode.MASS_NUMBER ) {{
//        setBackground( COLOR );
//        setFont( LABEL_FONT );
//      }};
//      buttonPanel.add( massNumberButton );
//      PropertyRadioButton<DisplayMode> atomicMassButton = new PropertyRadioButton<DisplayMode>( BuildAnAtomStrings.ATOMIC_MASS, displayModeProperty, DisplayMode.ATOMIC_MASS ) {{
//        setBackground( COLOR );
//        setFont( LABEL_FONT );
//      }};
//      buttonPanel.add( atomicMassButton );
//      addChild( new PSwing( buttonPanel ) );
//    }
//  }
//}
