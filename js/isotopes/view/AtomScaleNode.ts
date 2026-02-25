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
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import scale_png from '../../../mipmaps/scale_png.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';

const atomicMassStringProperty = IsotopesAndAtomicMassStrings.atomicMassStringProperty;
const massNumberStringProperty = IsotopesAndAtomicMassStrings.massNumberStringProperty;

type DisplayMode = 'massNumber' | 'atomicMass';

const WEIGH_SCALE_WIDTH = 275;
const READOUT_SIZE = new Dimension2( 88, 35 );
const RADIO_BUTTON_LABEL_OPTIONS = {
  font: new PhetFont( 14 ),
  maxWidth: 125,
  fill: 'white'
};

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
      if ( this.displayModeProperty.get() === 'massNumber' ) {
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

class AtomScaleNode extends Node {
  private readonly displayModeProperty: Property<DisplayMode>;

  public constructor( atom: ParticleAtom ) {
    super();

    this.displayModeProperty = new Property<DisplayMode>( 'massNumber' );

    // Add the image of the weigh scale, scaled to the desired width.
    const weighScaleImage = new Image( scale_png );
    weighScaleImage.scale( WEIGH_SCALE_WIDTH / weighScaleImage.width );
    this.addChild( weighScaleImage );

    // Add the readout of the atom's mass number or atomic mass.
    const scaleReadoutNode = new ScaleReadoutNode( atom, this.displayModeProperty );
    scaleReadoutNode.left = WEIGH_SCALE_WIDTH * 0.075;
    scaleReadoutNode.centerY = weighScaleImage.height * 0.7;
    this.addChild( scaleReadoutNode );

    // Define the items for the radio button group that will allow the user to select whether to display the mass number
    // or atomic mass.
    const radioButtonGroupItems: AquaRadioButtonGroupItem<DisplayMode>[] = [
      {
        value: 'massNumber',
        createNode: () => new Text( massNumberStringProperty, RADIO_BUTTON_LABEL_OPTIONS )
      },
      {
        value: 'atomicMass',
        createNode: () => new Text( atomicMassStringProperty, RADIO_BUTTON_LABEL_OPTIONS )
      }
    ];

    // Create and add the radio button group that selects the display mode.
    const displayModeSelector = new AquaRadioButtonGroup<DisplayMode>(
      this.displayModeProperty,
      radioButtonGroupItems,
      {
        spacing: 8,
        align: 'left',
        radioButtonOptions: {
          radius: 7
        },
        touchAreaXDilation: 10,
        mouseAreaXDilation: 10,
        centerX: ( scaleReadoutNode.right + weighScaleImage.width - 5 ) / 2,
        centerY: weighScaleImage.height * 0.7
      }
    );
    this.addChild( displayModeSelector );
  }

  public reset(): void {
    this.displayModeProperty.reset();
  }
}

isotopesAndAtomicMass.register( 'AtomScaleNode', AtomScaleNode );
export default AtomScaleNode;