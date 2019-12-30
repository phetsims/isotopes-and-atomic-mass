// Copyright 2014-2019, University of Colorado Boulder

/**
 * Node that represents a scale on which an atom can be weighed.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

define( require => {
  'use strict';

  // modules
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );

  // images
  const scaleImage = require( 'mipmap!ISOTOPES_AND_ATOMIC_MASS/scale.png' );

  // strings
  const atomicMassString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/atomicMass' );
  const massNumberString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/massNumber' );

  // class data
  const DISPLAY_MODE = { MASS_NUMBER: 'mass number', ATOMIC_MASS: 'atomic mass' };
  const SCALE_WIDTH = 275; //This is the width Aspect Ratio will control height
  const READOUT_SIZE = new Dimension2( 80, 50 );

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

    const readoutText = new Text( '', {
      font: new PhetFont( 20 ),
      maxWidth: 0.9 * READOUT_SIZE.width,
      maxHeight: 0.9 * READOUT_SIZE.height
    } );

    function updateReadout() {
      if ( displayModeProperty.get() === DISPLAY_MODE.MASS_NUMBER ) {
        readoutText.setText( atom.massNumberProperty.get().toString() );
      } else {
        const isotopeAtomicMass = atom.getIsotopeAtomicMass();
        readoutText.setText( isotopeAtomicMass > 0 ? Utils.toFixed( isotopeAtomicMass, 5 ) : '--' );
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
    const radioButtonRadius = 6;
    const LABEL_FONT = new PhetFont( 14 );
    const massNumberButton = new AquaRadioButton( displayModeProperty, DISPLAY_MODE.MASS_NUMBER,
      new Text( massNumberString, {
        font: LABEL_FONT,
        maxWidth: 125,
        fill: 'white'
      } ), { radius: radioButtonRadius } );
    const atomicMassButton = new AquaRadioButton( displayModeProperty, DISPLAY_MODE.ATOMIC_MASS,
      new Text( atomicMassString, {
        font: LABEL_FONT,
        maxWidth: 125,
        fill: 'white'
      } ), { radius: radioButtonRadius } );
    const displayButtonGroup = new Node();
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
    const weighScaleImage = new Image( scaleImage );
    weighScaleImage.scale( SCALE_WIDTH / weighScaleImage.width );
    this.addChild( weighScaleImage );

    // Add the scale readout node which displays either atomic mass or number.
    const scaleReadoutNode = new ScaleReadoutNode( atom, this.displayModeProperty );
    scaleReadoutNode.left = SCALE_WIDTH * 0.075; // empirically determined
    scaleReadoutNode.centerY = weighScaleImage.height * 0.7; // empirically determined

    this.addChild( scaleReadoutNode );

    // Add the display mode selector to the scale base.
    const displayModeSelectionNode = new DisplayModeSelectionNode( this.displayModeProperty );
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

