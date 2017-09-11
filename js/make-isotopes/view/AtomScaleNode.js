// Copyright 2014-2015, University of Colorado Boulder

/**
 * Node that represents a scale on which an atom can be weighed.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

define( function( require ) {
  'use strict';

  // modules
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  // images
  var scaleImage = require( 'mipmap!ISOTOPES_AND_ATOMIC_MASS/scale.png' );

  // strings
  var atomicMassString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/atomicMass' );
  var massNumberString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/massNumber' );

  // class data
  var DISPLAY_MODE = { MASS_NUMBER: 'mass number', ATOMIC_MASS: 'atomic mass' };
  var SCALE_WIDTH = 275; //This is the width Aspect Ratio will control height
  var READOUT_SIZE = new Dimension2( 80, 50 );

  /**
   * Utility function that defines the readout on the front of the scale. This readout can display an atom's mass as
   * either the mass number, which is an integer number representing the total number of nucleons, or as the atomic
   * mass, which is the relative actual mass of the atom.
   *
   * @param {NumberAtom} atom
   * @param {Property} displayModeProperty
   */
  function ScaleReadoutNode( atom, displayModeProperty ) {
    this.atom = atom;

    var readoutText = new Text( '', {
      font: new PhetFont( 20 ),
      maxWidth: 0.9 * READOUT_SIZE.width,
      maxHeight: 0.9 * READOUT_SIZE.height
    } );

    function updateReadout() {
      if ( displayModeProperty.get() === DISPLAY_MODE.MASS_NUMBER ) {
        readoutText.setText( atom.massNumberProperty.get().toString() );
      } else {
        var isotopeAtomicMass = atom.getIsotopeAtomicMass();
        readoutText.setText( isotopeAtomicMass > 0 ? Util.toFixed( isotopeAtomicMass, 5 ) : '--' );
      }

      // Center the text in the display.
      readoutText.centerX = READOUT_SIZE.width / 2;
      readoutText.centerY = READOUT_SIZE.height * 0.325;
    }

    // Watch the property that represents the display mode and update the readout when it changes.
    // Doesn't need unlink as it stays through out the sim life
    displayModeProperty.link( function() {
      updateReadout();
    } );

    // Watch the atom and update the readout whenever it changes.
    // Doesn't need unlink as it stays through out the sim life
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
   * Creates and return a node containing the radio buttons that allow the user to select the display mode for the scale.
   *
   * @param {Property} displayModeProperty
   */
  function DisplayModeSelectionNode( displayModeProperty ) {
    var radioButtonRadius = 6;
    var LABEL_FONT = new PhetFont( 14 );
    var massNumberButton = new AquaRadioButton( displayModeProperty, DISPLAY_MODE.MASS_NUMBER,
      new Text( massNumberString, {
        font: LABEL_FONT,
        maxWidth: 125,
        fill: 'white'
      } ), { radius: radioButtonRadius } );
    var atomicMassButton = new AquaRadioButton( displayModeProperty, DISPLAY_MODE.ATOMIC_MASS,
      new Text( atomicMassString, {
        font: LABEL_FONT,
        maxWidth: 125,
        fill: 'white'
      } ), { radius: radioButtonRadius } );
    var displayButtonGroup = new Node();
    displayButtonGroup.addChild( massNumberButton );
    atomicMassButton.top = massNumberButton.bottom + 8;
    atomicMassButton.left = displayButtonGroup.left;
    displayButtonGroup.addChild( atomicMassButton );
    return displayButtonGroup;
  }

  /**
   * Constructor for an AtomScaleNode.
   *
   * @param {ParticleAtom} atom
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
    scaleReadoutNode.left = SCALE_WIDTH * 0.075; // empirically determined
    scaleReadoutNode.centerY = weighScaleImage.height * 0.7; // empirically determined

    this.addChild( scaleReadoutNode );

    // Add the display mode selector to the scale base.
    var displayModeSelectionNode = new DisplayModeSelectionNode( this.displayModeProperty );
    // Position the selector next to the readout.
    displayModeSelectionNode.centerX = ( scaleReadoutNode.right + weighScaleImage.width - 5 ) / 2; // empirically determined
    displayModeSelectionNode.centerY = weighScaleImage.height * 0.7; // empirically determined
    this.addChild( displayModeSelectionNode );
  }

  isotopesAndAtomicMass.register( 'AtomScaleNode', AtomScaleNode );
  return inherit( Node, AtomScaleNode, {

    /**
     * Reset the atom scale node to its initial state by resetting the display mode property.
     */
    reset: function() {
      this.displayModeProperty.reset();
    }
  } );
} );

