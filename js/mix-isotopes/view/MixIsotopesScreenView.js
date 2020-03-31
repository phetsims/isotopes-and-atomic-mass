// Copyright 2014-2020, University of Colorado Boulder

/**
 * Screen view for the tab where the user makes isotopes of a given element by adding and removing neutrons.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import inherit from '../../../../phet-core/js/inherit.js';
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
import BucketDragHandler from '../../../../shred/js/view/BucketDragHandler.js';
import ExpandedPeriodicTableNode from '../../../../shred/js/view/ExpandedPeriodicTableNode.js';
import IsotopeCanvasNode from '../../../../shred/js/view/IsotopeCanvasNode.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import RadioButtonGroup from '../../../../sun/js/buttons/RadioButtonGroup.js';
import HSlider from '../../../../sun/js/HSlider.js';
import isotopesAndAtomicMassStrings from '../../isotopesAndAtomicMassStrings.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import MixIsotopesModel from '../model/MixIsotopesModel.js';
import AverageAtomicMassIndicator from './AverageAtomicMassIndicator.js';
import ControlIsotope from './ControlIsotope.js';
import IsotopeProportionsPieChart from './IsotopeProportionsPieChart.js';

const averageAtomicMassString = isotopesAndAtomicMassStrings.averageAtomicMass;
const isotopeMixtureString = isotopesAndAtomicMassStrings.isotopeMixture;
const myMixString = isotopesAndAtomicMassStrings.myMix;
const naturesMixString = isotopesAndAtomicMassStrings.naturesMix;
const percentCompositionString = isotopesAndAtomicMassStrings.percentComposition;

// constants
const MAX_SLIDER_WIDTH = 99.75; //empirically determined

/**
 * Created a node containing radio buttons to select My Mix or Nature's Mix
 * @param {Property} isotopeMixtureProperty
 */
function IsotopeMixtureSelectionNode( isotopeMixtureProperty ) {
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
  const displayButtonGroup = new Node();
  displayButtonGroup.addChild( label );
  myMixButton.top = label.bottom + 3;
  myMixButton.left = displayButtonGroup.left;
  displayButtonGroup.addChild( myMixButton );
  naturesMixButton.top = myMixButton.bottom + 8;
  naturesMixButton.left = displayButtonGroup.left;
  displayButtonGroup.addChild( naturesMixButton );
  return displayButtonGroup;
}

/**
 * Created a node containing radio buttons to select Buckets or Sliders in My Mix
 * @param {MixIsotopesModel} model
 * @param {ModelViewTransform2} modelViewTransform
 */
function InteractivityModeSelectionNode( model, modelViewTransform ) {
  const bucketNode = new Node();
  const bucket = new Bucket( {
    baseColor: Color.gray,
    size: new Dimension2( 50, 30 )
  } );
  bucketNode.addChild( new BucketHole( bucket, modelViewTransform ) );
  bucketNode.addChild( new BucketFront( bucket, modelViewTransform ) );
  bucketNode.scale( 0.5 );

  const range = new Range( 0, 100 );
  const slider = new HSlider( new Property( 50 ), range, {
    trackSize: new Dimension2( 50, 5 ),
    thumbSize: new Dimension2( 15, 30 ),
    majorTickLength: 15
  } );
  slider.addMajorTick( 0 );
  slider.addMajorTick( 100 );
  slider.scale( 0.5 );

  const radioButtonContent = [
    { value: MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS, node: bucketNode },
    { value: MixIsotopesModel.InteractivityMode.SLIDERS_AND_SMALL_ATOMS, node: slider }
  ];
  return new RadioButtonGroup( model.interactivityModeProperty, radioButtonContent, {
    orientation: 'horizontal',
    baseColor: Color.white,
    spacing: 5,
    selectedStroke: '#3291b8',
    selectedLineWidth: 2,
    deselectedContentOpacity: 0.2
  } );
}

/**
 * @param {MixIsotopesModel} mixIsotopesModel
 * @param {Tandem} tandem
 * @constructor
 */
function MixIsotopesScreenView( mixIsotopesModel, tandem ) {
  ScreenView.call( this, { layoutBounds: ShredConstants.LAYOUT_BOUNDS } );

  this.model = mixIsotopesModel;
  const self = this;
  this.updatePieChart = true; // track when to update pie chart in the animation frame

  // Set up the model view transform. The test chamber is centered at (0, 0) in model space, and this transform is set
  // up to place the chamber where we want it on the canvas.
  // IMPORTANT NOTES: The multiplier factors for the 2nd point can be adjusted to shift the center right or left, and
  // the scale factor can be adjusted to zoom in or out (smaller numbers zoom out, larger ones zoom in).
  this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO,
    new Vector2( Utils.roundSymmetric( this.layoutBounds.width * 0.32 ),
      Utils.roundSymmetric( this.layoutBounds.height * 0.33 ) ),
    1.0
  );

  // Add the nodes that will allow the canvas to be layered.
  const controlsLayer = new Node();
  this.addChild( controlsLayer );
  const bucketHoleLayer = new Node();
  this.addChild( bucketHoleLayer );
  const chamberLayer = new Node();
  this.addChild( chamberLayer );
  // rendering these two nodes at last so that isotopes are at the over everything but behind the bucket
  const isotopeLayer = new Node();
  const bucketFrontLayer = new Node();

  // Adding Buckets
  function addBucketView( addedBucket ) {
    const bucketHole = new BucketHole( addedBucket, self.modelViewTransform );
    const bucketFront = new BucketFront( addedBucket, self.modelViewTransform );
    bucketFront.addInputListener( new BucketDragHandler( addedBucket, bucketFront, self.modelViewTransform ) );

    // Bucket hole is first item added to view for proper layering.
    bucketHoleLayer.addChild( bucketHole );
    bucketFrontLayer.addChild( bucketFront );
    bucketFront.moveToFront();

    mixIsotopesModel.bucketList.addItemRemovedListener( function removalListener( removedBucket ) {
      if ( removedBucket === addedBucket ) {
        bucketHoleLayer.removeChild( bucketHole );
        bucketFrontLayer.removeChild( bucketFront );
        mixIsotopesModel.bucketList.removeItemRemovedListener( removalListener );
      }
    } );
  }

  mixIsotopesModel.bucketList.addItemAddedListener( function( addedBucket ) { addBucketView( addedBucket ); } );
  mixIsotopesModel.bucketList.forEach( function( addedBucket ) { addBucketView( addedBucket ); } );

  // Adding Isotopes
  function addIsotopeView( addedIsotope ) {
    const isotopeView = new ParticleView( addedIsotope, self.modelViewTransform );
    isotopeView.center = self.modelViewTransform.modelToViewPosition( addedIsotope.positionProperty.get() );
    isotopeView.pickable = ( mixIsotopesModel.interactivityModeProperty.get() ===
                             MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS );

    isotopeLayer.addChild( isotopeView );

    const moveToFront = function( value ) {
      if ( value ) {
        isotopeView.moveToFront();
      }
    };
    addedIsotope.userControlledProperty.link( moveToFront );
    mixIsotopesModel.isotopesList.addItemRemovedListener( function removalListener( removedIsotope ) {
      if ( removedIsotope === addedIsotope ) {
        isotopeLayer.removeChild( isotopeView );
        addedIsotope.userControlledProperty.unlink( moveToFront );
        isotopeView.dispose();
        mixIsotopesModel.isotopesList.removeItemRemovedListener( removalListener );
      }
    } );
  }

  mixIsotopesModel.isotopesList.forEach( function( addedIsotope ) { addIsotopeView( addedIsotope ); } );

  mixIsotopesModel.isotopesList.addItemAddedListener( function( addedIsotope ) {
    if ( mixIsotopesModel.interactivityModeProperty.get() ===
         MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
      addIsotopeView( addedIsotope );
    }
    else {
      self.isotopesLayer.setIsotopes( self.model.isotopesList );
      mixIsotopesModel.isotopesList.addItemRemovedListener( function removalListener( removedIsotope ) {
        if ( removedIsotope === addedIsotope ) {
          self.isotopesLayer.setIsotopes( self.model.isotopesList );
          mixIsotopesModel.isotopesList.removeItemRemovedListener( removalListener );
        }
      } );
    }
  } );

  // Adding Numeric Controllers
  mixIsotopesModel.numericalControllerList.addItemAddedListener( function( addedController ) {
    const controllerView = new ControlIsotope( addedController, 0, 100 );
    const center_pos = self.modelViewTransform.modelToViewPosition( addedController.centerPosition );
    controllerView.centerY = center_pos.y;
    // if the width of slider decreases due to thumb position, keep the left position fixed
    controllerView.left = center_pos.x - ( MAX_SLIDER_WIDTH / 2 );
    controlsLayer.addChild( controllerView );

    mixIsotopesModel.numericalControllerList.addItemRemovedListener( function removalListener( removedController ) {
      if ( removedController === addedController ) {
        controlsLayer.removeChild( controllerView );
        controllerView.dispose();
        mixIsotopesModel.numericalControllerList.removeItemRemovedListener( removalListener );
      }
    } );
  } );

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
  this.model.naturesIsotopeUpdated.addListener( function() {
    self.isotopesLayer.setIsotopes( self.model.naturesIsotopesList );
  } );

  const clearBoxButton = new EraserButton( {
    baseColor: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
    listener: function() {
      mixIsotopesModel.clearBox();
    }
  } );
  this.addChild( clearBoxButton );
  clearBoxButton.top = chamberLayer.bottom + 5;
  clearBoxButton.left = chamberLayer.left;

  // Add the interactive periodic table that allows the user to select the current element.  Heaviest interactive
  // element is Neon for this sim.
  const periodicTableNode = new ExpandedPeriodicTableNode( mixIsotopesModel.selectedAtomConfig, 18, {
    tandem: tandem
  } );
  periodicTableNode.scale( 0.55 );
  periodicTableNode.top = 10;
  periodicTableNode.right = this.layoutBounds.width - 10;
  this.addChild( periodicTableNode );

  this.isotopeProportionsPieChart = new IsotopeProportionsPieChart( this.model );
  this.isotopeProportionsPieChart.scale( 0.6 );
  this.isotopeProportionsPieChart.centerX = this.isotopeProportionsPieChart.centerX + 150; // Empirically determined
  const compositionBox = new AccordionBox( this.isotopeProportionsPieChart, {
    cornerRadius: 3,
    titleNode: new Text( percentCompositionString, {
      font: ShredConstants.ACCORDION_BOX_TITLE_FONT,
      maxWidth: ShredConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
    } ),
    fill: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
    expandedProperty: new Property( true ),
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
    expandedProperty: new Property( true ),
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

  // Create and add the Reset All Button in the bottom right, which resets the model
  const resetAllButton = new ResetAllButton( {
    listener: function() {
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

  // Doesn't need unlink as it stays through out the sim life
  mixIsotopesModel.showingNaturesMixProperty.link( function() {
    if ( mixIsotopesModel.showingNaturesMixProperty.get() === true ) {
      interactivityModeSelectionNode.visible = false;
      clearBoxButton.visible = false;
      self.isotopesLayer.visible = true;
    }
    else {
      interactivityModeSelectionNode.visible = true;
      clearBoxButton.visible = true;
      self.isotopesLayer.visible = false;
    }
    if ( mixIsotopesModel.interactivityModeProperty.get() === MixIsotopesModel.InteractivityMode.SLIDERS_AND_SMALL_ATOMS && mixIsotopesModel.showingNaturesMixProperty.get() === false ) {
      self.isotopesLayer.visible = true;
      self.isotopesLayer.setIsotopes( self.model.isotopesList );
    }
  } );

  // Doesn't need unlink as it stays through out the sim life
  mixIsotopesModel.interactivityModeProperty.link( function() {
    if ( mixIsotopesModel.interactivityModeProperty.get() === MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
      self.isotopesLayer.visible = false;
    }
    else {
      self.isotopesLayer.visible = true;
      self.isotopesLayer.setIsotopes( self.model.isotopesList );
    }
  } );

  // Doesn't need unlink as it stays through out the sim life
  mixIsotopesModel.testChamber.isotopeCountProperty.link( function( isotopeCount ) {
    self.updatePieChart = true;
  } );
}

isotopesAndAtomicMass.register( 'MixIsotopesScreenView', MixIsotopesScreenView );
export default inherit( ScreenView, MixIsotopesScreenView, {
  step: function() {
    // as an optimization we would updating pie chart once every animation frame in place of updating it every time
    // isotope is added in the test chamber in single animation frame
    if ( this.updatePieChart ) {
      this.isotopeProportionsPieChart.update();
      this.updatePieChart = false;
    }
  }

} );