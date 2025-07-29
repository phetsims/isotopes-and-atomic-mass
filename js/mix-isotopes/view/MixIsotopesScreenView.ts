// Copyright 2014-2025, University of Colorado Boulder

/**
 * Screen view for the tab where the user makes isotopes of a given element by adding and removing neutrons.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import Bucket from '../../../../phetcommon/js/model/Bucket.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BucketFront from '../../../../scenery-phet/js/bucket/BucketFront.js';
import BucketHole from '../../../../scenery-phet/js/bucket/BucketHole.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import BucketDragListener from '../../../../shred/js/view/BucketDragListener.js';
import ExpandedPeriodicTableNode from '../../../../shred/js/view/ExpandedPeriodicTableNode.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import RectangularRadioButtonGroup, { RectangularRadioButtonGroupItem } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';
import MixIsotopesModel, { InteractivityModeType } from '../model/MixIsotopesModel.js';
import MonoIsotopeBucket from '../model/MonoIsotopeBucket.js';
import MovableAtom from '../model/MovableAtom.js';
import NumericalIsotopeQuantityControl from '../model/NumericalIsotopeQuantityControl.js';
import AverageAtomicMassIndicator from './AverageAtomicMassIndicator.js';
import ControlIsotope from './ControlIsotope.js';
import IsotopeCanvasNode from './IsotopeCanvasNode.js';
import IsotopeProportionsPieChart from './IsotopeProportionsPieChart.js';

const averageAtomicMassString = IsotopesAndAtomicMassStrings.averageAtomicMass;
const isotopeMixtureString = IsotopesAndAtomicMassStrings.isotopeMixture;
const myMixString = IsotopesAndAtomicMassStrings.myMix;
const naturesMixString = IsotopesAndAtomicMassStrings.naturesMix;
const percentCompositionString = IsotopesAndAtomicMassStrings.percentComposition;

// constants
const MAX_SLIDER_WIDTH = 99.75; // empirically determined

class MixIsotopesScreenView extends ScreenView {

  public readonly model: MixIsotopesModel;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly isotopesLayer: IsotopeCanvasNode;
  private readonly isotopeProportionsPieChart: IsotopeProportionsPieChart;
  private updatePieChart: boolean;

  /**
   * @param mixIsotopesModel - MixIsotopesModel instance
   * @param tandem - Tandem instance
   */
  public constructor( mixIsotopesModel: MixIsotopesModel, tandem: Tandem ) {

    super( { layoutBounds: new Bounds2( 0, 0, 768, 464 ) } );

    this.model = mixIsotopesModel;
    this.updatePieChart = true;

    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2(
        roundSymmetric( this.layoutBounds.width * 0.32 ),
        roundSymmetric( this.layoutBounds.height * 0.33 )
      ),
      1.0
    );

    // Layer setup
    const controlsLayer = new Node();
    this.addChild( controlsLayer );
    const bucketHoleLayer = new Node();
    this.addChild( bucketHoleLayer );
    const chamberLayer = new Node();
    this.addChild( chamberLayer );
    const isotopeLayer = new Node();
    const bucketFrontLayer = new Node();

    // Buckets
    const addBucketView = ( addedBucket: MonoIsotopeBucket ) => {
      const bucketHole = new BucketHole( addedBucket, this.modelViewTransform );
      const bucketFront = new BucketFront( addedBucket, this.modelViewTransform );
      bucketFront.addInputListener( new BucketDragListener( addedBucket, bucketFront, this.modelViewTransform ) );
      bucketHoleLayer.addChild( bucketHole );
      bucketFrontLayer.addChild( bucketFront );
      bucketFront.moveToFront();

      mixIsotopesModel.bucketList.addItemRemovedListener( function removalListener( removedBucket: Bucket ) {
        if ( removedBucket === addedBucket ) {
          bucketHoleLayer.removeChild( bucketHole );
          bucketFront.interruptSubtreeInput();
          bucketFrontLayer.removeChild( bucketFront );
          mixIsotopesModel.bucketList.removeItemRemovedListener( removalListener );
        }
      } );
    };

    mixIsotopesModel.bucketList.addItemAddedListener( addBucketView );
    mixIsotopesModel.bucketList.forEach( addBucketView );

    // Isotopes
    const addIsotopeView = ( addedIsotope: MovableAtom ) => {
      const isotopeView = new ParticleView( addedIsotope, this.modelViewTransform, {
        isotopeNodeOptions: {
          baseColor: this.model.getColorForIsotope(
            addedIsotope.atomConfiguration.protonCount,
            addedIsotope.atomConfiguration.neutronCount
          ),
          protonCount: addedIsotope.atomConfiguration.protonCount,
          massNumber: addedIsotope.atomConfiguration.protonCount + addedIsotope.atomConfiguration.neutronCount
        }
      } );
      isotopeView.center = this.modelViewTransform.modelToViewPosition( addedIsotope.positionProperty.get() );
      isotopeView.pickable = ( mixIsotopesModel.interactivityModeProperty.get() === 'bucketsAndLargeAtoms' );
      isotopeLayer.addChild( isotopeView );

      const moveToFront = ( value: boolean ) => {
        if ( value ) {
          isotopeView.moveToFront();
        }
      };
      addedIsotope.isDraggingProperty.link( moveToFront );
      mixIsotopesModel.isotopesList.addItemRemovedListener( function removalListener( removedIsotope: MovableAtom ) {
        if ( removedIsotope === addedIsotope ) {
          isotopeLayer.removeChild( isotopeView );
          addedIsotope.isDraggingProperty.unlink( moveToFront );
          isotopeView.dispose();
          mixIsotopesModel.isotopesList.removeItemRemovedListener( removalListener );
        }
      } );
    };

    mixIsotopesModel.isotopesList.forEach( addIsotopeView );

    mixIsotopesModel.isotopesList.addItemAddedListener( addedIsotope => {
      if ( mixIsotopesModel.interactivityModeProperty.get() === 'bucketsAndLargeAtoms' ) {
        addIsotopeView( addedIsotope );
      }
      else {
        this.isotopesLayer.setIsotopes( this.model.isotopesList );
        const removalListener = ( removedIsotope: MovableAtom ) => {
          if ( removedIsotope === addedIsotope ) {
            this.isotopesLayer.setIsotopes( this.model.isotopesList );
            mixIsotopesModel.isotopesList.removeItemRemovedListener( removalListener );
          }
        };
        mixIsotopesModel.isotopesList.addItemRemovedListener( removalListener );
      }
    } );

    // Numeric controllers
    mixIsotopesModel.numericalControllerList.addItemAddedListener( addedController => {
      const controllerView = new ControlIsotope( addedController, 0, 100 );
      const center_pos = this.modelViewTransform.modelToViewPosition( addedController.centerPosition );
      controllerView.centerY = center_pos.y;
      controllerView.left = center_pos.x - ( MAX_SLIDER_WIDTH / 2 );
      controlsLayer.addChild( controllerView );

      mixIsotopesModel.numericalControllerList.addItemRemovedListener( function removalListener( removedController: NumericalIsotopeQuantityControl ) {
        if ( removedController === addedController ) {
          controlsLayer.removeChild( controllerView );
          controllerView.dispose();
          mixIsotopesModel.numericalControllerList.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // Test chamber
    const testChamberNode = new Rectangle( this.modelViewTransform.modelToViewBounds(
      this.model.testChamber.getTestChamberRect() ), {
      fill: 'black',
      lineWidth: 1
    } );
    chamberLayer.addChild( testChamberNode );
    this.isotopesLayer = new IsotopeCanvasNode( this.model.naturesIsotopesList, this.modelViewTransform, {
      canvasBounds: this.modelViewTransform.modelToViewBounds( this.model.testChamber.getTestChamberRect() )
    } );
    this.addChild( this.isotopesLayer );
    this.isotopesLayer.visible = false;
    this.model.naturesIsotopeUpdated.addListener( () => {
      this.isotopesLayer.setIsotopes( this.model.naturesIsotopesList );
    } );

    const clearBoxButton = new EraserButton( {
      baseColor: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      listener: () => {
        mixIsotopesModel.clearBox();
      }
    } );
    this.addChild( clearBoxButton );
    clearBoxButton.top = chamberLayer.bottom + 5;
    clearBoxButton.left = chamberLayer.left;

    // Periodic table
    const periodicTableNode = new ExpandedPeriodicTableNode( mixIsotopesModel.selectedAtomConfig, 18, {
      tandem: tandem
    } );
    periodicTableNode.scale( 0.55 );
    periodicTableNode.top = 10;
    periodicTableNode.right = this.layoutBounds.width - 10;
    this.addChild( periodicTableNode );

    // Pie chart
    this.isotopeProportionsPieChart = new IsotopeProportionsPieChart( this.model );
    this.isotopeProportionsPieChart.scale( 0.6 );
    this.isotopeProportionsPieChart.centerX = this.isotopeProportionsPieChart.centerX + 150;
    const compositionBox = new AccordionBox( this.isotopeProportionsPieChart, {
      cornerRadius: 3,
      titleNode: new Text( percentCompositionString, {
        font: ShredConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: ShredConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      } ),
      fill: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property<boolean>( true ),
      minWidth: periodicTableNode.width,
      maxWidth: periodicTableNode.width,
      contentAlign: 'center',
      titleAlignX: 'left',
      buttonAlign: 'right',
      expandCollapseButtonOptions: {
        touchAreaXDilation: 16,
        touchAreaYDilation: 16
      }
    } );
    compositionBox.left = periodicTableNode.left;
    compositionBox.top = periodicTableNode.bottom + 15;
    this.addChild( compositionBox );

    const averageAtomicMassBox = new AccordionBox( new AverageAtomicMassIndicator( this.model ), {
      cornerRadius: 3,
      titleNode: new Text( averageAtomicMassString, {
        font: ShredConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: ShredConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      } ),
      fill: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property<boolean>( true ),
      minWidth: periodicTableNode.width,
      maxWidth: periodicTableNode.width,
      contentAlign: 'center',
      titleAlignX: 'left',
      buttonAlign: 'right',
      expandCollapseButtonOptions: {
        touchAreaXDilation: 16,
        touchAreaYDilation: 16
      }
    } );
    averageAtomicMassBox.left = compositionBox.left;
    averageAtomicMassBox.top = compositionBox.bottom + 10;
    this.addChild( averageAtomicMassBox );

    const interactivityModeSelectionNode = new InteractivityModeSelectionNode( mixIsotopesModel, this.modelViewTransform );
    interactivityModeSelectionNode.right = testChamberNode.right;
    interactivityModeSelectionNode.top = testChamberNode.bottom + 5;
    this.addChild( interactivityModeSelectionNode );

    const isotopeMixtureSelectionNode = new IsotopeMixtureSelectionNode( mixIsotopesModel.showingNaturesMixProperty );
    isotopeMixtureSelectionNode.top = averageAtomicMassBox.bottom + 10;
    isotopeMixtureSelectionNode.left = averageAtomicMassBox.left;
    this.addChild( isotopeMixtureSelectionNode );

    // Reset all button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        mixIsotopesModel.reset();
        compositionBox.expandedProperty.reset();
        averageAtomicMassBox.expandedProperty.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    resetAllButton.scale( 0.85 );
    this.addChild( resetAllButton );

    this.addChild( isotopeLayer );
    this.addChild( bucketFrontLayer );

    // visibility updates
    mixIsotopesModel.showingNaturesMixProperty.link( () => {
      if ( mixIsotopesModel.showingNaturesMixProperty.value ) {
        interactivityModeSelectionNode.visible = false;
        clearBoxButton.visible = false;
        this.isotopesLayer.visible = true;
      }
      else {
        interactivityModeSelectionNode.visible = true;
        clearBoxButton.visible = true;
        this.isotopesLayer.visible = false;
      }
      if ( mixIsotopesModel.interactivityModeProperty.get() === 'slidersAndSmallAtoms' &&
           !mixIsotopesModel.showingNaturesMixProperty.get() ) {
        this.isotopesLayer.visible = true;
        this.isotopesLayer.setIsotopes( this.model.isotopesList );
      }
    } );

    mixIsotopesModel.interactivityModeProperty.link( () => {
      if ( mixIsotopesModel.interactivityModeProperty.get() === 'bucketsAndLargeAtoms' ) {
        this.isotopesLayer.visible = false;
      }
      else {
        this.isotopesLayer.visible = true;
        this.isotopesLayer.setIsotopes( this.model.isotopesList );
      }
    } );

    mixIsotopesModel.testChamber.isotopeCountProperty.link( () => {
      this.updatePieChart = true;
    } );

    Multilink.multilink(
      [ mixIsotopesModel.showingNaturesMixProperty, mixIsotopesModel.interactivityModeProperty ],
      () => { isotopeLayer.interruptSubtreeInput(); }
    );
    mixIsotopesModel.selectedAtomConfig.atomUpdated.addListener( () => {
      isotopeLayer.interruptSubtreeInput();
    } );
  }

  /**
   * step the time-dependent behavior
   */
  public override step(): void {
    if ( this.updatePieChart ) {
      this.isotopeProportionsPieChart.update();
      this.updatePieChart = false;
    }
  }
}

/**
 * selector node containing radio buttons to select between My Mix or Nature's Mix
 */
class IsotopeMixtureSelectionNode extends Node {

  public constructor( isotopeMixtureProperty: Property<boolean> ) {
    super();
    const radioButtonRadius = 6;
    const LABEL_FONT = new PhetFont( 14 );
    const MAX_WIDTH = 160;
    const myMixButton = new AquaRadioButton(
      isotopeMixtureProperty,
      false,
      new Text( myMixString, { font: LABEL_FONT, maxWidth: MAX_WIDTH } ), { radius: radioButtonRadius }
    );
    const naturesMixButton = new AquaRadioButton(
      isotopeMixtureProperty,
      true,
      new Text( naturesMixString, { font: LABEL_FONT, maxWidth: MAX_WIDTH } ), { radius: radioButtonRadius }
    );
    const label = new Text( isotopeMixtureString, { font: LABEL_FONT, maxWidth: MAX_WIDTH } );
    this.addChild( label );
    myMixButton.left = 0;
    myMixButton.top = label.bottom + 3;
    this.addChild( myMixButton );
    naturesMixButton.left = 0;
    naturesMixButton.top = myMixButton.bottom + 8;
    this.addChild( naturesMixButton );
  }
}

/**
 * selector node containing radio buttons to select Buckets or Sliders in "My Mix" mode
 */
class InteractivityModeSelectionNode extends RectangularRadioButtonGroup<InteractivityModeType> {

  public constructor( model: MixIsotopesModel, modelViewTransform: ModelViewTransform2 ) {
    const bucketNode = new Node();
    const bucket = new Bucket( {
      baseColor: Color.gray,
      size: new Dimension2( 50, 30 )
    } );
    bucketNode.addChild( new BucketHole( bucket, modelViewTransform ) );
    bucketNode.addChild( new BucketFront( bucket, modelViewTransform ) );
    bucketNode.scale( 0.5 );

    const range = new Range( 0, 100 );
    const slider = new HSlider( new Property<number>( 50 ), range, {
      trackSize: new Dimension2( 50, 5 ),
      thumbSize: new Dimension2( 15, 30 ),
      majorTickLength: 15,
      tagName: null
    } );
    slider.addMajorTick( 0 );
    slider.addMajorTick( 100 );
    slider.scale( 0.5 );

    const radioButtonContent: RectangularRadioButtonGroupItem<InteractivityModeType>[] = [
      { value: 'bucketsAndLargeAtoms', createNode: () => bucketNode },
      { value: 'slidersAndSmallAtoms', createNode: () => slider }
    ];

    super( model.interactivityModeProperty, radioButtonContent, {
      orientation: 'horizontal',
      spacing: 5,
      radioButtonOptions: {
        baseColor: Color.white,
        buttonAppearanceStrategyOptions: {
          selectedStroke: '#3291b8',
          selectedLineWidth: 2,
          deselectedButtonOpacity: 0.2
        }
      }
    } );
  }
}

isotopesAndAtomicMass.register( 'MixIsotopesScreenView', MixIsotopesScreenView );
export default MixIsotopesScreenView;