// Copyright 2014-2023, University of Colorado Boulder

/**
 * Screen view where the user makes isotopes of a given element by adding and removing neutrons.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import ExpandedPeriodicTableNode from '../../../../shred/js/view/ExpandedPeriodicTableNode.js';
import ParticleCountDisplay from '../../../../shred/js/view/ParticleCountDisplay.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';
import AtomScaleNode from './AtomScaleNode.js';
import InteractiveIsotopeNode from './InteractiveIsotopeNode.js';
import TwoItemPieChartNode from './TwoItemPieChartNode.js';

// constants
const NUMBER_FONT = new PhetFont( 70 );
const NUMBER_INSET = 20; // In screen coords, which are roughly pixels.
const SYMBOL_BOX_WIDTH = 275; // In screen coords, which are roughly pixels.
const SYMBOL_BOX_HEIGHT = 300; // In screen coords, which are roughly pixels.
const OPEN_CLOSE_BUTTON_TOUCH_AREA_DILATION = 12;

const abundanceInNatureString = IsotopesAndAtomicMassStrings.abundanceInNature;
const symbolString = IsotopesAndAtomicMassStrings.symbol;

class MakeIsotopesScreenView extends ScreenView {

  /**
   * @param {MakeIsotopesModel} makeIsotopesModel
   * @param {Tandem} tandem
   */
  constructor( makeIsotopesModel, tandem ) {
    super( { layoutBounds: ShredConstants.LAYOUT_BOUNDS } );

    // Set up the model-canvas transform.  IMPORTANT NOTES: The multiplier factors for the point in the view can be
    // adjusted to shift the center right or left, and the scale factor can be adjusted to zoom in or out (smaller
    // numbers zoom out, larger ones zoom in).
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO,
      new Vector2( Utils.roundSymmetric( this.layoutBounds.width * 0.4 ),
        Utils.roundSymmetric( this.layoutBounds.height * 0.49 ) ),
      1.0
    );

    // Layers upon which the various display elements are placed. This allows us to create the desired layering effects.
    const indicatorLayer = new Node();
    this.addChild( indicatorLayer );
    //adding this layer later so that its on the top
    const atomLayer = new Node();

    // Create and add the Reset All Button in the bottom right, which resets the model
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        makeIsotopesModel.reset();
        scaleNode.reset();
        symbolBox.expandedProperty.reset();
        abundanceBox.expandedProperty.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    resetAllButton.scale( 0.85 );
    this.addChild( resetAllButton );


    // Create the node that represents the scale upon which the atom sits.
    const scaleNode = new AtomScaleNode( makeIsotopesModel.particleAtom );

    // The scale needs to sit just below the atom, and there are some "tweak factors" needed to get it looking right.
    scaleNode.setCenterBottom( new Vector2( this.modelViewTransform.modelToViewX( 0 ), this.bottom ) );
    this.addChild( scaleNode );

    // Create the node that contains both the atom and the neutron bucket.
    const bottomOfAtomPosition = new Vector2( scaleNode.centerX, scaleNode.top + 15 ); //empirically determined

    const atomAndBucketNode = new InteractiveIsotopeNode( makeIsotopesModel, this.modelViewTransform, bottomOfAtomPosition );
    atomLayer.addChild( atomAndBucketNode );

    // Add the interactive periodic table that allows the user to select the current element.  Heaviest interactive
    // element is Neon for this sim.
    const periodicTableNode = new ExpandedPeriodicTableNode( makeIsotopesModel.numberAtom, 10, {
      tandem: tandem
    } );
    periodicTableNode.scale( 0.65 );
    periodicTableNode.top = 10;
    periodicTableNode.right = this.layoutBounds.width - 10;
    this.addChild( periodicTableNode );

    // Add the legend/particle count indicator.
    const particleCountLegend = new ParticleCountDisplay( makeIsotopesModel.particleAtom, 13, 250 );
    particleCountLegend.scale( 1.1 );
    particleCountLegend.left = 20;
    particleCountLegend.top = periodicTableNode.visibleBounds.minY;
    indicatorLayer.addChild( particleCountLegend );

    const symbolRectangle = new Rectangle( 0, 0, SYMBOL_BOX_WIDTH, SYMBOL_BOX_HEIGHT, 0, 0, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 2
    } );

    // Add the symbol text.
    const symbolText = new Text( '', {
      font: new PhetFont( 150 ),
      fill: 'black',
      center: new Vector2( symbolRectangle.width / 2, symbolRectangle.height / 2 )
    } );

    // Add the listener to update the symbol text.
    const textCenter = new Vector2( symbolRectangle.width / 2, symbolRectangle.height / 2 );
    // Doesn't need unlink as it stays through out the sim life
    makeIsotopesModel.particleAtom.protonCountProperty.link( protonCount => {
      const symbol = AtomIdentifier.getSymbol( protonCount );
      symbolText.string = protonCount > 0 ? symbol : '';
      symbolText.center = textCenter;
    } );
    symbolRectangle.addChild( symbolText );

    // Add the proton count display.
    const protonCountDisplay = new Text( '0', {
      font: NUMBER_FONT,
      fill: 'red'
    } );
    symbolRectangle.addChild( protonCountDisplay );

    // Add the listener to update the proton count.
    // Doesn't need unlink as it stays through out the sim life
    makeIsotopesModel.particleAtom.protonCountProperty.link( protonCount => {
      protonCountDisplay.string = protonCount;
      protonCountDisplay.left = NUMBER_INSET;
      protonCountDisplay.bottom = SYMBOL_BOX_HEIGHT - NUMBER_INSET;
    } );

    // Add the mass number display.
    const massNumberDisplay = new Text( '0', {
      font: NUMBER_FONT,
      fill: 'black'
    } );
    symbolRectangle.addChild( massNumberDisplay );

    // Add the listener to update the mass number.
    // Doesn't need unlink as it stays through out the sim life
    makeIsotopesModel.particleAtom.massNumberProperty.link( massNumber => {
      massNumberDisplay.string = massNumber;
      massNumberDisplay.left = NUMBER_INSET;
      massNumberDisplay.top = NUMBER_INSET;
    } );

    symbolRectangle.scale( 0.20 );
    const symbolBox = new AccordionBox( symbolRectangle, {
      cornerRadius: 3,
      titleNode: new Text( symbolString, {
        font: ShredConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: ShredConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      } ),
      fill: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property( false ),
      minWidth: periodicTableNode.visibleBounds.width,
      contentAlign: 'center',
      titleAlignX: 'left',
      buttonAlign: 'right',
      expandCollapseButtonOptions: {
        touchAreaXDilation: OPEN_CLOSE_BUTTON_TOUCH_AREA_DILATION,
        touchAreaYDilation: OPEN_CLOSE_BUTTON_TOUCH_AREA_DILATION
      }
    } );
    symbolBox.left = periodicTableNode.visibleBounds.minX;
    symbolBox.top = periodicTableNode.bottom + 10;
    this.addChild( symbolBox );

    const abundanceBox = new AccordionBox( new TwoItemPieChartNode( makeIsotopesModel ), {
      cornerRadius: 3,
      titleNode: new Text( abundanceInNatureString, {
        font: ShredConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: ShredConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      } ),
      fill: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property( false ),
      minWidth: periodicTableNode.visibleBounds.width,
      contentAlign: 'center',
      contentXMargin: 0,
      titleAlignX: 'left',
      buttonAlign: 'right',
      expandCollapseButtonOptions: {
        touchAreaXDilation: OPEN_CLOSE_BUTTON_TOUCH_AREA_DILATION,
        touchAreaYDilation: OPEN_CLOSE_BUTTON_TOUCH_AREA_DILATION
      }
    } );
    abundanceBox.left = symbolBox.left;
    abundanceBox.top = symbolBox.bottom + 10;
    this.addChild( abundanceBox );
    this.addChild( atomLayer );
  }
}

isotopesAndAtomicMass.register( 'MakeIsotopesScreenView', MakeIsotopesScreenView );
export default MakeIsotopesScreenView;