// Copyright 2014-2026, University of Colorado Boulder

/**
 * Node that represents a scale on which an atom can be weighed.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import { TReadOnlyNumberAtom } from '../../../../shred/js/model/NumberAtom.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import Panel from '../../../../sun/js/Panel.js';
import scale_png from '../../../mipmaps/scale_png.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';

const atomicMassStringProperty = IsotopesAndAtomicMassStrings.atomicMassStringProperty;
const massNumberStringProperty = IsotopesAndAtomicMassStrings.massNumberStringProperty;

const DISPLAY_MODE = { MASS_NUMBER: 'mass number', ATOMIC_MASS: 'atomic mass' } as const;
type DisplayMode = typeof DISPLAY_MODE[keyof typeof DISPLAY_MODE];

const SCALE_WIDTH = 275;
const READOUT_SIZE = new Dimension2( 88, 35 );

class ScaleReadoutNode extends Panel {
  private readonly atom: TReadOnlyNumberAtom;
  private readonly displayModeProperty: Property<DisplayMode>;
  private readonly readoutText: Text;

  public constructor(
    atom: TReadOnlyNumberAtom,
    displayModeProperty: Property<DisplayMode>
  ) {

    const readoutText = new Text( '', {
      font: new PhetFont( 20 ),
      maxWidth: 0.9 * READOUT_SIZE.width,
      maxHeight: 0.9 * READOUT_SIZE.height
    } );

    super( readoutText, {
      minWidth: READOUT_SIZE.width,
      maxWidth: READOUT_SIZE.width,
      minHeight: READOUT_SIZE.height,
      maxHeight: READOUT_SIZE.height,
      resize: false,
      cornerRadius: 5,
      lineWidth: 3,
      align: 'center'
    } );

    this.atom = atom;
    this.displayModeProperty = displayModeProperty;
    this.readoutText = readoutText;

    const updateReadout = (): void => {
      if ( this.displayModeProperty.get() === DISPLAY_MODE.MASS_NUMBER ) {
        this.readoutText.string = this.atom.massNumberProperty.get().toString();
      }
      else {
        const isotopeAtomicMass = this.atom.getIsotopeAtomicMass();
        this.readoutText.string = isotopeAtomicMass > 0 ? toFixed( isotopeAtomicMass, 5 ) : '--';
      }
      this.readoutText.centerX = READOUT_SIZE.width / 2;
      this.readoutText.centerY = READOUT_SIZE.height / 2;
    };

    this.displayModeProperty.link( updateReadout );
    this.atom.massNumberProperty.link( updateReadout );
    updateReadout();
  }
}

class DisplayModeSelectionNode extends Node {
  public constructor( displayModeProperty: Property<DisplayMode> ) {
    super();
    const radioButtonRadius = 6;
    const LABEL_FONT = new PhetFont( 14 );
    const massNumberButton = new AquaRadioButton(
      displayModeProperty,
      DISPLAY_MODE.MASS_NUMBER,
      new Text( massNumberStringProperty, {
        font: LABEL_FONT,
        maxWidth: 125,
        fill: 'white'
      } ),
      { radius: radioButtonRadius }
    );
    const atomicMassButton = new AquaRadioButton(
      displayModeProperty,
      DISPLAY_MODE.ATOMIC_MASS,
      new Text( atomicMassStringProperty, {
        font: LABEL_FONT,
        maxWidth: 125,
        fill: 'white'
      } ),
      { radius: radioButtonRadius }
    );
    this.addChild( massNumberButton );
    atomicMassButton.top = massNumberButton.bottom + 8;
    atomicMassButton.left = this.left;
    this.addChild( atomicMassButton );
  }
}

class AtomScaleNode extends Node {
  private readonly displayModeProperty: Property<DisplayMode>;

  public constructor( atom: ParticleAtom ) {
    super();

    this.displayModeProperty = new Property<DisplayMode>( DISPLAY_MODE.MASS_NUMBER );

    // Add the scale image, scaled to the desired width.
    const weighScaleImage = new Image( scale_png );
    weighScaleImage.scale( SCALE_WIDTH / weighScaleImage.width );
    this.addChild( weighScaleImage );

    // Add the readout of the atom's mass number or atomic mass.
    const scaleReadoutNode = new ScaleReadoutNode( atom, this.displayModeProperty );
    scaleReadoutNode.left = SCALE_WIDTH * 0.075;
    scaleReadoutNode.centerY = weighScaleImage.height * 0.7;
    this.addChild( scaleReadoutNode );

    // Add the display mode selector to the scale base, positioned between the readout and the right edge of the scale.
    const displayModeSelectionNode = new DisplayModeSelectionNode( this.displayModeProperty );
    displayModeSelectionNode.centerX = ( scaleReadoutNode.right + weighScaleImage.width - 5 ) / 2;
    displayModeSelectionNode.centerY = weighScaleImage.height * 0.7;
    this.addChild( displayModeSelectionNode );
  }

  /**
   * Reset the atom scale node to its initial state by resetting the display mode property.
   */
  public reset(): void {
    this.displayModeProperty.reset();
  }
}

isotopesAndAtomicMass.register( 'AtomScaleNode', AtomScaleNode );
export default AtomScaleNode;