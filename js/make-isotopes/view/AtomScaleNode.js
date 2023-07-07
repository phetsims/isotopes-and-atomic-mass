// Copyright 2014-2023, University of Colorado Boulder

/**
 * Node that represents a scale on which an atom can be weighed.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image, Node, Text } from '../../../../scenery/js/imports.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Panel from '../../../../sun/js/Panel.js';
import scale_png from '../../../mipmaps/scale_png.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';

const atomicMassString = IsotopesAndAtomicMassStrings.atomicMass;
const massNumberString = IsotopesAndAtomicMassStrings.massNumber;

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
      readoutText.setString( atom.massNumberProperty.get().toString() );
    }
    else {
      const isotopeAtomicMass = atom.getIsotopeAtomicMass();
      readoutText.setString( isotopeAtomicMass > 0 ? Utils.toFixed( isotopeAtomicMass, 5 ) : '--' );
    }

    // Center the text in the display.
    readoutText.centerX = READOUT_SIZE.width / 2;
    readoutText.centerY = READOUT_SIZE.height * 0.325;
  }

  // Watch the property that represents the display mode and update the readout when it changes.
  // Doesn't need unlink as it stays through out the sim life
  displayModeProperty.link( () => {
    updateReadout();
  } );

  // Watch the atom and update the readout whenever it changes.
  // Doesn't need unlink as it stays through out the sim life
  atom.massNumberProperty.link( () => {
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

class AtomScaleNode extends Node {

  /**
   * Constructor for an AtomScaleNode.
   *
   * @param {ParticleAtom} atom
   */
  constructor( atom ) {

    super();

    this.displayModeProperty = new Property( DISPLAY_MODE.MASS_NUMBER );

    // This is Loading the scale image and scaling it to desired width and adding to the node
    const weighScaleImage = new Image( scale_png );
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

  /**
   * Reset the atom scale node to its initial state by resetting the display mode property.
   * @public
   */
  reset() {
    this.displayModeProperty.reset();
  }
}

isotopesAndAtomicMass.register( 'AtomScaleNode', AtomScaleNode );
export default AtomScaleNode;