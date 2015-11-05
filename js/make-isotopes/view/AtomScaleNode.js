// Copyright 2002-2014, University of Colorado Boulder

/**
 * Node that represents a scale on which an atom can be weighed.  This node is intended to have a faux 3D look to it,
 * but is not truly 3D in any way.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Vector2 = require( 'DOT/Vector2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Property = require( 'AXON/Property' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Util = require( 'DOT/Util' );
  var Panel = require( 'SUN/Panel' );

  // images
  var scaleImage = require( 'mipmap!ISOTOPES_AND_ATOMIC_MASS/scale.png' );

  // strings
  var massNumberNameString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/mass-number.title' );
  var atomicMassNameString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/atomic-mass.title' );

  // class data
  var DISPLAY_MODE = { MASS_NUMBER: 'mass number', ATOMIC_MASS: 'atomic mass' };
  var SCALE_WIDTH = 320; //This is the width Aspect Ratio will control height
  var READOUT_SIZE = new Dimension2( 100, 50 );

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

    var readoutText = new Text( '', { font: new PhetFont( 24 ), maxWidth: 0.9 * READOUT_SIZE.width, maxHeight: 0.9 * READOUT_SIZE.height } );

    function updateReadout() {
      if ( displayModeProperty.get() === DISPLAY_MODE.MASS_NUMBER ) {
        readoutText.setText( atom.massNumber.toString() );
      }
      else {
        var isotopeAtomicMass = atom.getIsotopeAtomicMass();
        readoutText.setText( isotopeAtomicMass > 0 ? Util.toFixed( isotopeAtomicMass, 5 ) : '--' );
      }

      // Center the text in the display.
      readoutText.centerX = READOUT_SIZE.width / 2;
      readoutText.centerY = READOUT_SIZE.height * 0.4;
    }

    // Watch the property that represents the display mode and update the readout when it changes.
    displayModeProperty.link( function() {
      updateReadout();
    } );

    // Watch the atom and update the readout whenever it changes.
    atom.massNumberProperty.link( function() {
      updateReadout();
    } );

    return new Panel( readoutText, {
      minWidth: READOUT_SIZE.width,
      minHeight: READOUT_SIZE.height,
      resize: false,
      cornerRadius: 5,
      lineWidth: 3,
      align: 'center'

    } );
  }

  /**
   * This object contains the radio buttons that allow the user to select the display mode for the scale.
   *
   * @constructor
   * @author John Blanco
   * @author Jesse Greenberg
   */
  function DisplayModeSelectionNode( displayModeProperty ) {

    var LABEL_FONT = new PhetFont( 15 );

    var radioButtonContent = [
      { value: DISPLAY_MODE.MASS_NUMBER, node: new Text( massNumberNameString, { font: LABEL_FONT, maxWidth: 125 } ) },
      { value: DISPLAY_MODE.ATOMIC_MASS, node: new Text( atomicMassNameString, { font: LABEL_FONT, maxWidth: 125 } ) }
    ];

    var radioButtonGroup = new RadioButtonGroup( displayModeProperty, radioButtonContent, {
      orientation: 'vertical',
      selectedLineWidth: 2,
      deselectedLineWidth: 0,
      spacing: 1
    } );

    return radioButtonGroup;

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

    // This is Loading the scale image and scaling it to desired width and adding to the node
    var weighScaleImage = new Image( scaleImage );
    weighScaleImage.scale( SCALE_WIDTH / weighScaleImage.width );
    this.addChild( weighScaleImage );

    // Add the scale readout node which displays either atomic mass or number.
    var scaleReadoutNode = new ScaleReadoutNode( atom, this.displayModeProperty );
    //scaleReadoutNode.setLeftCenter( new Vector2( SIZE.width * 0.16, weighScaleImage.centerY + 55 ) );
    scaleReadoutNode.left = SCALE_WIDTH * 0.1;
    scaleReadoutNode.centerY = weighScaleImage.height * 0.75;

    this.addChild( scaleReadoutNode );

    // Add the display mode selector to the scale base.
    var displayModeSelectionNode = new DisplayModeSelectionNode( this.displayModeProperty );
    // Position the selector next to the readout.
    displayModeSelectionNode.center = new Vector2( (scaleReadoutNode.right + weighScaleImage.width - 5) / 2, weighScaleImage.centerY + 55 );
    this.addChild( displayModeSelectionNode );
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