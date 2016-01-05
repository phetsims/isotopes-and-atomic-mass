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
  var Dimension2 = require( 'DOT/Dimension2' );
  var ExpandedPeriodicTableNode = require( 'SHRED/view/ExpandedPeriodicTableNode' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var IsotopesAndAtomicMassConstants = require( 'ISOTOPES_AND_ATOMIC_MASS/common/IsotopesAndAtomicMassConstants' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ParticleView = require( 'SHRED/view/ParticleView' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SharedConstants = require( 'SHRED/SharedConstants' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var ControlIsotope = require( 'ISOTOPES_AND_ATOMIC_MASS/mix-isotopes/view/ControlIsotope' );

  // constants
  var INTERACTIVITY_MODE = {
    BUCKETS_AND_LARGE_ATOMS: 'BUCKETS_AND_LARGE_ATOMS',
    SLIDERS_AND_SMALL_ATOMS: 'SLIDERS_AND_SMALL_ATOMS'
  };

  // strings
  var myMixString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/myMix' );
  var natureMixString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/natureMix' );
  var isotopeMixtureString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/isotopeMixture' );
  var clearBoxString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/clearBox' );
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

  function InteractivityModeSelectionNode( interactivityModeProperty, mvt ) {
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
      { value: INTERACTIVITY_MODE.BUCKETS_AND_LARGE_ATOMS, node: bucketNode },
      { value: INTERACTIVITY_MODE.SLIDERS_AND_SMALL_ATOMS, node: slider }
    ];
    var radioButtonGroup = new RadioButtonGroup( interactivityModeProperty, radioButtonContent, {
      orientation: 'horizontal',
      selectedLineWidth: 1,
      baseColor: Color.white,
      cornerRadius: 1,
      spacing: 5
    } );
    return radioButtonGroup;
  }


  /**
   * @param {MakeIsotopesModel} makeIsotopesModel
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

    // Map of the buckets in the model to their view representation.
    this.mapBucketToView = {};

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

    // Create and add the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        mixIsotopesModel.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );

    // Add the interactive periodic table that allows the user to select the current element.  Heaviest interactive
    // element is Neon for this sim.
    var periodicTableNode = new ExpandedPeriodicTableNode( mixIsotopesModel.numberAtom, 18, tandem );
    periodicTableNode.scale( 0.55 );
    periodicTableNode.top = 10;
    periodicTableNode.right = this.layoutBounds.width - 10;
    this.addChild( periodicTableNode );

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
      isotopeView.pickable = !(mixIsotopesModel.showingNaturesMix);

      isotopeLayer.addChild( isotopeView );

      mixIsotopesModel.isotopesList.addItemRemovedListener( function removalListener( removedIsotope ) {
        if ( removedIsotope === addedIsotope ) {
          isotopeLayer.removeChild( isotopeView );
          mixIsotopesModel.isotopesList.removeItemRemovedListener( removalListener );
        }
      } );
    }

    mixIsotopesModel.isotopesList.forEach ( function( addedIsotope ) { addIsotopeView( addedIsotope ); });
    mixIsotopesModel.isotopesList.addItemAddedListener ( function( addedIsotope ) { addIsotopeView( addedIsotope ); });

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

    var compositionBox = new AccordionBox( new Rectangle( 0, 0, 60, 60, 0, 0 ), {
      titleNode: new Text( percentCompositionString, { font: SharedConstants.ACCORDION_BOX_TITLE_FONT, maxWidth: 200 } ),
      fill: SharedConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property( false ),
      minWidth: periodicTableNode.width,
      maxWidth: periodicTableNode.width,
      contentAlign: 'center',
      titleAlignX: 'left',
      buttonAlign: 'right'
    });
    compositionBox.leftTop = periodicTableNode.leftBottom;
    compositionBox.top = periodicTableNode.bottom + 5;
    this.addChild( compositionBox );

    var averageAtomicMassBox = new AccordionBox( new AverageAtomicMassIndicator( this.model ), {
        titleNode: new Text( averageAtomicMassString, { font: SharedConstants.ACCORDION_BOX_TITLE_FONT, maxWidth: 200 } ),
        fill: SharedConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
        expandedProperty: new Property( false ),
        minWidth: periodicTableNode.width,
        maxWidth: periodicTableNode.width,
        contentAlign: 'center',
        titleAlignX: 'left',
        buttonAlign: 'right'
      }
    );
    averageAtomicMassBox.leftTop = compositionBox.leftBottom;
    averageAtomicMassBox.top = compositionBox.bottom + 5;
    this.addChild( averageAtomicMassBox );

    var isotopeMixtureSelectionNode = new IsotopeMixtureSelectionNode( mixIsotopesModel.showingNaturesMixProperty );
    isotopeMixtureSelectionNode.rightTop = averageAtomicMassBox.rightBottom;
    isotopeMixtureSelectionNode.top = averageAtomicMassBox.bottom + 5;
    this.addChild( isotopeMixtureSelectionNode );
    isotopeMixtureSelectionNode.right = resetAllButton.left - 10;
    isotopeMixtureSelectionNode.bottom = resetAllButton.bottom - 10;

    var interactivityModeSelectionNode = new InteractivityModeSelectionNode( mixIsotopesModel.interactivityModeProperty , this.mvt);
    interactivityModeSelectionNode.leftTop = averageAtomicMassBox.leftBottom;
    interactivityModeSelectionNode.top = averageAtomicMassBox.bottom + 5;
    this.addChild( interactivityModeSelectionNode );
    interactivityModeSelectionNode.top = isotopeMixtureSelectionNode.top;

    var clearBoxButton = new RectangularPushButton( {
      content: new Text( clearBoxString, { font: new PhetFont( 14 ), maxWidth: 63 } ),
      listener: function() { mixIsotopesModel.clearBox(); },
      baseColor: SharedConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      fireOnDown: true,
      cornerRadius: 1
    } );
    this.addChild( clearBoxButton );
    clearBoxButton.top = interactivityModeSelectionNode.bottom + 10;
    clearBoxButton.left = interactivityModeSelectionNode.left;

    mixIsotopesModel.showingNaturesMixProperty.link( function() {
      if ( mixIsotopesModel.showingNaturesMixProperty.get() === true ){
        interactivityModeSelectionNode.visible = false;
        clearBoxButton.visible = false;
      }
      else{
        interactivityModeSelectionNode.visible = true;
        clearBoxButton.visible = true;
      }
    } );


  }

  isotopesAndAtomicMass.register( 'MixIsotopesScreenView', MixIsotopesScreenView);
  return inherit( ScreenView, MixIsotopesScreenView );
} );
