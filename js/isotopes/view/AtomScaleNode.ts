// Copyright 2014-2026, University of Colorado Boulder

/**
 * AtomScaleNode is a Node that represents a scale on which an atom can be weighed.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import { toFixedNumber } from '../../../../dot/js/util/toFixedNumber.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
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

class AtomScaleNode extends Node {
  private readonly displayModeProperty: Property<DisplayMode>;

  public constructor( atom: ParticleAtom ) {
    super();

    this.displayModeProperty = new Property<DisplayMode>( 'massNumber' );

    // Add the image of the weigh scale, scaled to the desired width.
    const weighScaleImage = new Image( scale_png );
    weighScaleImage.scale( WEIGH_SCALE_WIDTH / weighScaleImage.width );
    this.addChild( weighScaleImage );

    // Create a derived Property for the number that will be displayed.
    const readoutNumberProperty = new DerivedProperty(
      [ this.displayModeProperty, atom.massNumberProperty ],
      ( displayMode, massNumber ) => {
        if ( displayMode === 'massNumber' ) {
          return massNumber;
        }
        else {
          const isotopeAtomicMass = atom.getIsotopeAtomicMass();
          return isotopeAtomicMass > 0 ? toFixedNumber( isotopeAtomicMass, 5 ) : 0;
        }
      }
    );

    // Create the readout of the atom's mass number or atomic mass.
    const readoutNode = new NumberDisplay(
      readoutNumberProperty,
      new Range( 1, 20.99999 ),
      {
        backgroundFill: Color.WHITE,
        cornerRadius: 3,
        backgroundLineWidth: 2,
        centerX: WEIGH_SCALE_WIDTH * 0.075 + READOUT_SIZE.width / 2,
        centerY: weighScaleImage.height * 0.7,
        align: 'center',
        xMargin: 1,
        yMargin: 3,
        textOptions: {
          font: new PhetFont( 19 )
        },
        numberFormatter: ( value: number ) => {
          if ( this.displayModeProperty.get() === 'massNumber' ) {
            return value.toString();
          }
          else {
            return value > 0 ? toFixed( value, 5 ) : '--';
          }
        }
      }
    );

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
        centerX: ( readoutNode.right + weighScaleImage.width - 5 ) / 2,
        centerY: weighScaleImage.height * 0.7
      }
    );

    const faceControls = new HBox( {
      children: [ readoutNode, displayModeSelector ],
      spacing: 10,
      centerX: weighScaleImage.width / 2,
      bottom: weighScaleImage.bottom - 12
    } );
    this.addChild( faceControls );
  }

  public reset(): void {
    this.displayModeProperty.reset();
  }
}

isotopesAndAtomicMass.register( 'AtomScaleNode', AtomScaleNode );
export default AtomScaleNode;