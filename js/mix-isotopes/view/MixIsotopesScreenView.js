// Copyright 2014-2015, University of Colorado Boulder

/**
 * Screen view for the tab where the user makes isotopes of a given element by adding and removing neutrons.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */
define( function( require ) {
  'use strict';

  // modules
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var AccordionBox = require( 'SUN/AccordionBox' );
  var AverageAtomicMassIndicator = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/AverageAtomicMassIndicator' );
  var Bucket = require( 'PHETCOMMON/model/Bucket' );
  var BucketDragHandler = require( 'SHRED/view/BucketDragHandler' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var Color = require( 'SCENERY/util/Color' );
  var ControlIsotope = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/ControlIsotope' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var EraserButton = require( 'SCENERY_PHET/buttons/EraserButton' );
  var ExpandedPeriodicTableNode = require( 'SHRED/view/ExpandedPeriodicTableNode' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var IsotopesAndAtomicMassConstants = require( 'ISOTOPES_AND_ATOMIC_MASS/common/IsotopesAndAtomicMassConstants' );
  var IsotopeCanvasNode = require( 'SHRED/view/IsotopeCanvasNode' );
  var IsotopeProprotionsPieChart = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/IsotopeProprotionsPieChart' );
  var MixIsotopesModel = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/model/MixIsotopesModel' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ParticleView = require( 'SHRED/view/ParticleView' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SharedConstants = require( 'SHRED/SharedConstants' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var myMixString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/myMix' );
  var natureMixString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/natureMix' );
  var isotopeMixtureString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/isotopeMixture' );
  var percentCompositionString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/percentComposition' );
  var averageAtomicMassString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/averageAtomicMass' );

  function IsotopeMixtureSelectionNode( isotopeMixtureProperty ) {
    var radioButtonRadius = 6;
    var LABEL_FONT = new PhetFont( 14 );
    var MAX_WIDTH = 80;
    var myMixButton = new AquaRadioButton( isotopeMixtureProperty, false, new Text( myMixString, { font: LABEL_FONT, maxWidth: MAX_WIDTH } ), { radius: radioButtonRadius } );
    var naturesMixButton = new AquaRadioButton( isotopeMixtureProperty, true, new Text( natureMixString, { font: LABEL_FONT, maxWidth: MAX_WIDTH } ), { radius: radioButtonRadius } );
    var label = new Text( isotopeMixtureString, { font: LABEL_FONT, maxWidth: MAX_WIDTH } );
    var displayButtonGroup = new Node();
    displayButtonGroup.addChild( label );
    myMixButton.top = label.bottom + 10;
    myMixButton.left = displayButtonGroup.left;
    displayButtonGroup.addChild( myMixButton );
    naturesMixButton.top = myMixButton.bottom + 8;
    naturesMixButton.left = displayButtonGroup.left;
    displayButtonGroup.addChild( naturesMixButton );
    return displayButtonGroup;
  }

  function InteractivityModeSelectionNode( model, mvt ) {
    var bucketNode = new Node();
    var bucket = new Bucket( { baseColor: Color.gray,
      caption: '',
      size: new Dimension2( 50, 30 )
    } );
    bucketNode.addChild( new BucketHole( bucket, mvt ) );
    bucketNode.addChild( new BucketFront( bucket, mvt ) );
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
    var radioButtonGroup = new RadioButtonGroup( model.interactivityModeProperty, radioButtonContent, {
      orientation: 'vertical',
      selectedLineWidth: 1,
      baseColor: Color.white,
      cornerRadius: 1,
      spacing: 5
    } );
    return radioButtonGroup;
  }


  /**
   * @param {MixIsotopesModel} mixIsotopesModel
   * @param tandem
   * @constructor
   */
  function MixIsotopesScreenView( mixIsotopesModel, tandem ) {
    // supertype constructor
    ScreenView.call( this, { layoutBounds:IsotopesAndAtomicMassConstants.LAYOUT_BOUNDS } );

    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------


    this.model = mixIsotopesModel;
    var self = this;
    this.updatePieChart = true; // track when to update pie chart in the animation frame


    // Set up the model view transform.  The test chamber is centered
    // at (0, 0) in model space, and this transform is set up to place
    // the chamber where we want it on the canvas.
    //
    // IMPORTANT NOTES: The multiplier factors for the 2nd point can be
    // adjusted to shift the center right or left, and the scale factor
    // can be adjusted to zoom in or out (smaller numbers zoom out, larger
    // ones zoom in).
    this.mvt = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO,
      new Vector2( Math.round( this.layoutBounds.width * 0.32 ), Math.round( this.layoutBounds.height * 0.35 ) ),
      1.0 // "Zoom factor" - smaller zooms out, larger zooms in.
    );

    // Add the nodes that will allow the canvas to be layered.
    var controlsLayer = new Node();
    this.addChild( controlsLayer );
    var bucketHoleLayer = new Node();
    this.addChild( bucketHoleLayer );
    var chamberLayer = new Node();
    this.addChild( chamberLayer );
    var isotopeLayer = new Node();
    this.addChild( isotopeLayer );
    var bucketFrontLayer = new Node();
    this.addChild( bucketFrontLayer );

    // Adding Buckets
    function addBucketView ( addedBucket ) {
      var bucketHole = new BucketHole( addedBucket, self.mvt);
      var bucketFront = new BucketFront( addedBucket, self.mvt );
      bucketFront.addInputListener( new BucketDragHandler( addedBucket, bucketFront, self.mvt ) );

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

    mixIsotopesModel.bucketList.addItemAddedListener( function( addedBucket ) { addBucketView( addedBucket); } );
    mixIsotopesModel.bucketList.forEach( function( addedBucket ) { addBucketView( addedBucket); } );

    // Adding Isotopes
    function addIsotopeView ( addedIsotope ){
      var isotopeView = new ParticleView( addedIsotope, self.mvt );
      isotopeView.center = self.mvt.modelToViewPosition( addedIsotope.position );
      isotopeView.pickable = ( mixIsotopesModel.interactivityModeProperty.get() === MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS );

      isotopeLayer.addChild( isotopeView );

      mixIsotopesModel.isotopesList.addItemRemovedListener( function removalListener( removedIsotope ) {
        if ( removedIsotope === addedIsotope ) {
          isotopeLayer.removeChild( isotopeView );
          mixIsotopesModel.isotopesList.removeItemRemovedListener( removalListener );
        }
      } );
    }

    mixIsotopesModel.isotopesList.forEach ( function( addedIsotope ) { addIsotopeView( addedIsotope ); });
    mixIsotopesModel.isotopesList.addItemAddedListener ( function( addedIsotope ) {
      if ( mixIsotopesModel.interactivityModeProperty.get() === MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS ) {
        addIsotopeView( addedIsotope );
      }
      else{
        self.isotopesLayer.setIsotopes( self.model.isotopesList );
        mixIsotopesModel.isotopesList.addItemRemovedListener( function removalListener( removedIsotope ) {
          if ( removedIsotope === addedIsotope ) {
            self.isotopesLayer.setIsotopes( self.model.isotopesList );
          }
        } );
      }
    });

    // Adding Numeric Controllers
    mixIsotopesModel.numericalControllerList.addItemAddedListener ( function( addedController ) {
      var controllerView = new ControlIsotope( addedController, 0, 100 );
      controllerView.center = self.mvt.modelToViewPosition( addedController.centerPosition );
      controlsLayer.addChild( controllerView );

      mixIsotopesModel.numericalControllerList.addItemRemovedListener( function removalListener( removedController ){
        if ( removedController === addedController ) {
          controlsLayer.removeChild( controllerView );
          mixIsotopesModel.numericalControllerList.removeItemRemovedListener( removalListener );
        }
      });
    });

    var testChamberNode = new Rectangle( this.mvt.modelToViewBounds( this.model.testChamber.getTestChamberRect() ), {
      fill: 'black',
      lineWidth: 1
    } );
    chamberLayer.addChild( testChamberNode );
    this.isotopesLayer = new IsotopeCanvasNode( this.model.naturesIsotopesList, this.mvt, {
      canvasBounds: this.mvt.modelToViewBounds( this.model.testChamber.getTestChamberRect() )
    } );
    this.addChild( this.isotopesLayer );
    this.isotopesLayer.visible = false;
    this.model.on( 'naturesIsotopeUpdated', function() {
      self.isotopesLayer.setIsotopes( self.model.naturesIsotopesList );
    });

    var clearBoxButton = new EraserButton( {
      baseColor: SharedConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      listener: function() {
        mixIsotopesModel.clearBox();
      }
    } );
    this.addChild( clearBoxButton );
    clearBoxButton.top = chamberLayer.bottom + 5;
    clearBoxButton.right = chamberLayer.right;

    // Add the interactive periodic table that allows the user to select the current element.  Heaviest interactive
    // element is Neon for this sim.
    var periodicTableNode = new ExpandedPeriodicTableNode( mixIsotopesModel.numberAtom, 18, tandem );
    periodicTableNode.scale( 0.55 );
    periodicTableNode.top = 10;
    periodicTableNode.right = this.layoutBounds.width - 10;
    this.addChild( periodicTableNode );

    this.isotopeProprotionsPieChart = new IsotopeProprotionsPieChart( this.model );
    this.isotopeProprotionsPieChart.scale( 0.6 );
    this.isotopeProprotionsPieChart.centerX = this.isotopeProprotionsPieChart.centerX + 150; // Emperically determined to make pie chart centered
    var compositionBox = new AccordionBox( this.isotopeProprotionsPieChart, {
      titleNode: new Text( percentCompositionString, {
        font: SharedConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: SharedConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      } ),
      fill: SharedConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property( true ),
      minWidth: periodicTableNode.width,
      maxWidth: periodicTableNode.width,
      contentAlign: 'center',
      titleAlignX: 'left',
      buttonAlign: 'right',
      buttonTouchAreaXDilation: 16,
      buttonTouchAreaYDilation: 16
    } );
    compositionBox.left = periodicTableNode.left;
    compositionBox.top = periodicTableNode.bottom + 15;
    this.addChild( compositionBox );

    var averageAtomicMassBox = new AccordionBox( new AverageAtomicMassIndicator( this.model ), {
        titleNode: new Text( averageAtomicMassString, {
          font: SharedConstants.ACCORDION_BOX_TITLE_FONT,
          maxWidth: SharedConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
        } ),
        fill: SharedConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
        expandedProperty: new Property( true ),
        minWidth: periodicTableNode.width,
        maxWidth: periodicTableNode.width,
        contentAlign: 'center',
        titleAlignX: 'left',
        buttonAlign: 'right',
        buttonTouchAreaXDilation: 16,
        buttonTouchAreaYDilation: 16
      }
    );
    averageAtomicMassBox.left = compositionBox.left;
    averageAtomicMassBox.top = compositionBox.bottom + 10;
    this.addChild( averageAtomicMassBox );

    var interactivityModeSelectionNode = new InteractivityModeSelectionNode( mixIsotopesModel , this.mvt);
    interactivityModeSelectionNode.left = averageAtomicMassBox.left;
    interactivityModeSelectionNode.top = averageAtomicMassBox.bottom + 10;
    this.addChild( interactivityModeSelectionNode );

    var isotopeMixtureSelectionNode = new IsotopeMixtureSelectionNode( mixIsotopesModel.showingNaturesMixProperty );
    isotopeMixtureSelectionNode.top = averageAtomicMassBox.bottom + 10;
    isotopeMixtureSelectionNode.left = interactivityModeSelectionNode.right + 10;
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
    resetAllButton.scale(0.85);
    this.addChild( resetAllButton );

    mixIsotopesModel.showingNaturesMixProperty.link( function() {
      if ( mixIsotopesModel.showingNaturesMixProperty.get() === true ){
        interactivityModeSelectionNode.visible = false;
        clearBoxButton.visible = false;
        self.isotopesLayer.visible = true;
      }
      else{
        interactivityModeSelectionNode.visible = true;
        clearBoxButton.visible = true;
        self.isotopesLayer.visible = false;
      }
      if ( mixIsotopesModel.interactivityModeProperty.get() === MixIsotopesModel.InteractivityMode.SLIDERS_AND_SMALL_ATOMS &&
           mixIsotopesModel.showingNaturesMixProperty.get() === false){
        self.isotopesLayer.visible = true;
        self.isotopesLayer.setIsotopes( self.model.isotopesList );
      }
    } );

    mixIsotopesModel.interactivityModeProperty.link( function() {
      if ( mixIsotopesModel.interactivityModeProperty.get() === MixIsotopesModel.InteractivityMode.BUCKETS_AND_LARGE_ATOMS ){
        self.isotopesLayer.visible = false;
      }
      else{
        self.isotopesLayer.visible = true;
        self.isotopesLayer.setIsotopes( self.model.isotopesList );

      }
    } );

    mixIsotopesModel.testChamber.isotopeCountProperty.link( function( isotopeCount ) {
      self.updatePieChart = true;
    } );
  }

  isotopesAndAtomicMass.register( 'MixIsotopesScreenView', MixIsotopesScreenView);
  return inherit( ScreenView, MixIsotopesScreenView, {
    step: function(){
      // as an optimization we would updating pie chart once every animation frame in place of updating it every time
      // isotope is added in the test chamber in single animation frame
      if ( this.updatePieChart ){
        this.isotopeProprotionsPieChart.update();
        this.updatePieChart = false;
      }
    }

  });
} );
