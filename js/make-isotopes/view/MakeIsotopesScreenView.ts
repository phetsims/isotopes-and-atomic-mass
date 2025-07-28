// Copyright 2014-2025, University of Colorado Boulder

/**
 * Screen view where the user makes isotopes of a given element by adding and removing neutrons.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import ExpandedPeriodicTableNode from '../../../../shred/js/view/ExpandedPeriodicTableNode.js';
import ParticleCountDisplay from '../../../../shred/js/view/ParticleCountDisplay.js';
import SymbolNode from '../../../../shred/js/view/SymbolNode.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';
import MakeIsotopesModel from '../model/MakeIsotopesModel.js';
import AtomScaleNode from './AtomScaleNode.js';
import InteractiveIsotopeNode from './InteractiveIsotopeNode.js';
import TwoItemPieChartNode from './TwoItemPieChartNode.js';

// constants
const OPEN_CLOSE_BUTTON_TOUCH_AREA_DILATION = 12;

const abundanceInNatureString: string = IsotopesAndAtomicMassStrings.abundanceInNature;
const symbolString: string = IsotopesAndAtomicMassStrings.symbol;

class MakeIsotopesScreenView extends ScreenView {

  private readonly modelViewTransform: ModelViewTransform2;

  public constructor( makeIsotopesModel: MakeIsotopesModel, tandem: Tandem ) {

    // A PhET wide decision was made to not update custom layout bounds even if they do not match the
    // default layout bounds in ScreenView. Do not change these bounds as changes could break or disturb
    // any phet-io instrumentation. https://github.com/phetsims/phet-io/issues/1939
    super( { layoutBounds: new Bounds2( 0, 0, 768, 464 ) } );

    // Set up the model-canvas transform.  IMPORTANT NOTES: The multiplier factors for the point in the view can be
    // adjusted to shift the center right or left, and the scale factor can be adjusted to zoom in or out (smaller
    // numbers zoom out, larger ones zoom in).
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( roundSymmetric( this.layoutBounds.width * 0.4 ), roundSymmetric( this.layoutBounds.height * 0.49 ) ),
      1.0
    );

    const indicatorLayer = new Node();
    this.addChild( indicatorLayer );
    const atomLayer = new Node();

    const scaleNode = new AtomScaleNode( makeIsotopesModel.particleAtom );
    this.addChild( scaleNode );
    scaleNode.setCenterBottom( new Vector2( this.modelViewTransform.modelToViewX( 0 ), this.layoutBounds.bottom ) );

    const resetAllButton = new ResetAllButton( {
      listener: (): void => {
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

    const bottomOfAtomPosition = new Vector2( scaleNode.centerX, scaleNode.top + 15 );
    const atomAndBucketNode = new InteractiveIsotopeNode( makeIsotopesModel, this.modelViewTransform, bottomOfAtomPosition );
    atomLayer.addChild( atomAndBucketNode );

    const periodicTableNode = new ExpandedPeriodicTableNode( makeIsotopesModel.numberAtom, 10, {
      tandem: tandem
    } );
    periodicTableNode.scale( 0.65 );
    periodicTableNode.top = 10;
    periodicTableNode.right = this.layoutBounds.width - 10;
    this.addChild( periodicTableNode );

    const particleCountLegend = new ParticleCountDisplay( makeIsotopesModel.particleAtom, Tandem.OPT_OUT, {
      maxParticles: 13,
      maxWidth: 250
    } );
    particleCountLegend.scale( 1.1 );
    particleCountLegend.left = 20;
    particleCountLegend.top = periodicTableNode.visibleBounds.minY;
    indicatorLayer.addChild( particleCountLegend );

    const symbolNode = new SymbolNode(
      makeIsotopesModel.particleAtom.protonCountProperty,
      makeIsotopesModel.particleAtom.massNumberProperty,
      { scale: 0.2 }
    );
    const symbolBox = new AccordionBox( symbolNode, {
      cornerRadius: 3,
      titleNode: new Text( symbolString, {
        font: ShredConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: ShredConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      } ),
      fill: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property<boolean>( false ),
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
      expandedProperty: new Property<boolean>( false ),
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