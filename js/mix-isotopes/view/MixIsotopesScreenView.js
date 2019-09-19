// Copyright 2014-2019, University of Colorado Boulder

/**
 * Screen view for the tab where the user makes isotopes of a given element by adding and removing neutrons.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */
define( require => {
  'use strict';

  // modules
  const AccordionBox = require( 'SUN/AccordionBox' );
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const AverageAtomicMassIndicator = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/AverageAtomicMassIndicator' );
  const Bucket = require( 'PHETCOMMON/model/Bucket' );
  const BucketDragHandler = require( 'SHRED/view/BucketDragHandler' );
  const BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  const BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  const Color = require( 'SCENERY/util/Color' );
  const ControlIsotope = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/ControlIsotope' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const EraserButton = require( 'SCENERY_PHET/buttons/EraserButton' );
  const ExpandedPeriodicTableNode = require( 'SHRED/view/ExpandedPeriodicTableNode' );
  const HSlider = require( 'SUN/HSlider' );
  const inherit = require( 'PHET_CORE/inherit' );
  const IsotopeCanvasNode = require( 'SHRED/view/IsotopeCanvasNode' );
  const IsotopeProportionsPieChart = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/IsotopeProportionsPieChart' );
  const isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  const MixIsotopesModel = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MixIsotopesModel' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const ParticleView = require( 'SHRED/view/ParticleView' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const ShredConstants = require( 'SHRED/ShredConstants' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const averageAtomicMassString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/averageAtomicMass' );
  const isotopeMixtureString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/isotopeMixture' );
  const myMixString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/myMix' );
  const naturesMixString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/naturesMix' );
  const percentCompositionString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/percentComposition' );

  // constants
  var MAX_SLIDER_WIDTH = 99.75; //empirically determined

  /**
   * Created a node containing radio buttons to select My Mix or Nature's Mix
   * @param {Property} isotopeMixtureProperty
   */
  function IsotopeMixtureSelectionNode( isotopeMixtureProperty ) {
    var radioButtonRadius = 6;
    var LABEL_FONT = new PhetFont( 14 );
    var MAX_WIDTH = 160;
    var myMixButton = new AquaRadioButton(
      isotopeMixtureProperty,
      false,
      new Text( myMixString, { font: LABEL_FONT, maxWidth: MAX_WIDTH } ), { radius: radioButtonRadius }
    );
    var naturesMixButton = new AquaRadioButton(
      isotopeMixtureProperty,
      true,
      new Text( naturesMixString, { font: LABEL_FONT, maxWidth: MAX_WIDTH } ), { radius: radioButtonRadius }
    );
    var label = new Text( isotopeMixtureString, { font: LABEL_FONT, maxWidth: MAX_WIDTH } );
    var displayButtonGroup = new Node();
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
    var bucketNode = new Node();
    var bucket = new Bucket( {
      baseColor: Color.gray,
      size: new Dimension2( 50, 30 )
    } );
    bucketNode.addChild( new BucketHole( bucket, modelViewTransform ) );
    bucketNode.addChild( new BucketFront( bucket, modelViewTransform ) );
    bucketNode.scale( 0.5 );

    var range = new Range( 0, 100 );
    var slider = new HSlider( new Property( 50 ), range, {
      trackSize: new Dimension2( 50, 5 ),
      thumbSize: new Dimension2( 15, 30 ),
      majorTickLength: 15
    } );
    slider.addMajorTick( 0 );
    slider.addMajorTick( 100 );
    slider.scale( 0.5 );

    var radioButtonContent = [
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
    var self = this;
    this.updatePieChart = true; // track when to update pie chart in the animation frame

    // Set up the model view transform. The test chamber is centered at (0, 0) in model space, and this transform is set
    // up to place the chamber where we want it on the canvas.
    // IMPORTANT NOTES: The multiplier factors for the 2nd point can be adjusted to shift the center right or left, and
    // the scale factor can be adjusted to zoom in or out (smaller numbers zoom out, larger ones zoom in).
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO,
      new Vector2( Util.roundSymmetric( this.layoutBounds.width * 0.32 ),
        Util.roundSymmetric( this.layoutBounds.height * 0.33 ) ),
      1.0
    );

    // Add the nodes that will allow the canvas to be layered.
    var controlsLayer = new Node();
    this.addChild( controlsLayer );
    var bucketHoleLayer = new Node();
    this.addChild( bucketHoleLayer );
    var chamberLayer = new Node();
    this.addChild( chamberLayer );
    // rendering these two nodes at last so that isotopes are at the over everything but behind the bucket
    var isotopeLayer = new Node();
    var bucketFrontLayer = new Node();

    // Adding Buckets
    function addBucketView( addedBucket ) {
      var bucketHole = new BucketHole( addedBucket, self.modelViewTransform );
      var bucketFront = new BucketFront( addedBucket, self.modelViewTransform );
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
      var isotopeView = new ParticleView( addedIsotope, self.modelViewTransform );
      isotopeView.center = self.modelViewTransform.modelToViewPosition( addedIsotope.positionProperty.get() );
      isotopeView.pickable = ( mixIsotopesModel.interactivityModeProperty.get() ===
        MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS );

      isotopeLayer.addChild( isotopeView );

      var moveToFront = function( value ) {
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
      } else {
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
      var controllerView = new ControlIsotope( addedController, 0, 100 );
      var center_pos = self.modelViewTransform.modelToViewPosition( addedController.centerPosition );
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

    var testChamberNode = new Rectangle( this.modelViewTransform.modelToViewBounds(
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

    var clearBoxButton = new EraserButton( {
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
    var periodicTableNode = new ExpandedPeriodicTableNode( mixIsotopesModel.selectedAtomConfig, 18, {
      tandem: tandem
    } );
    periodicTableNode.scale( 0.55 );
    periodicTableNode.top = 10;
    periodicTableNode.right = this.layoutBounds.width - 10;
    this.addChild( periodicTableNode );

    this.isotopeProportionsPieChart = new IsotopeProportionsPieChart( this.model );
    this.isotopeProportionsPieChart.scale( 0.6 );
    this.isotopeProportionsPieChart.centerX = this.isotopeProportionsPieChart.centerX + 150; // Empirically determined
    var compositionBox = new AccordionBox( this.isotopeProportionsPieChart, {
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

    var averageAtomicMassBox = new AccordionBox( new AverageAtomicMassIndicator( this.model ), {
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

    var interactivityModeSelectionNode = new InteractivityModeSelectionNode( mixIsotopesModel, this.modelViewTransform );
    interactivityModeSelectionNode.right = testChamberNode.right;
    interactivityModeSelectionNode.top = testChamberNode.bottom + 5;
    this.addChild( interactivityModeSelectionNode );

    var isotopeMixtureSelectionNode = new IsotopeMixtureSelectionNode( mixIsotopesModel.showingNaturesMixProperty );
    isotopeMixtureSelectionNode.top = averageAtomicMassBox.bottom + 10;
    isotopeMixtureSelectionNode.left = averageAtomicMassBox.left;
    this.addChild( isotopeMixtureSelectionNode );

    // Create and add the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
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
      } else {
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
      } else {
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
  return inherit( ScreenView, MixIsotopesScreenView, {
    step: function() {
      // as an optimization we would updating pie chart once every animation frame in place of updating it every time
      // isotope is added in the test chamber in single animation frame
      if ( this.updatePieChart ) {
        this.isotopeProportionsPieChart.update();
        this.updatePieChart = false;
      }
    }

  } );
} );

