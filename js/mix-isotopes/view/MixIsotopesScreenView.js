// Copyright 2002-2015, University of Colorado Boulder

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
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  // var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Vector2 = require( 'DOT/Vector2' );
  // var Dimension2 = require( 'DOT/Dimension2' );
  var Node = require( 'SCENERY/nodes/Node' );
  // var BucketDragHandler = require( 'SHRED/view/BucketDragHandler' );
  // var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  // var PeriodicTableNode = require( 'SHRED/view/PeriodicTableNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  // var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // class data
  // var DISTANCE_BUTTON_CENTER_FROM_BOTTOM = 30;
  // var BUTTON_FONT = new PhetFont( { weight: 'bold', fontSize: 18 } );


  /**
   * @param {MakeIsotopesModel} makeIsotopesModel
   * @constructor
   */
  function MixIsotopesScreenView( mixIsotopesModel ) {
    // supertype constructor
    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 768, 504 ) } );

    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------


    this.model = mixIsotopesModel;


    // Set up the model-canvas transform.  The test chamber is centered
    // at (0, 0) in model space, and this transform is set up to place
    // the chamber where we want it on the canvas.
    //
    // IMPORTANT NOTES: The multiplier factors for the 2nd point can be
    // adjusted to shift the center right or left, and the scale factor
    // can be adjusted to zoom in or out (smaller numbers zoom out, larger
    // ones zoom in).
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( 0, 0 ),
      new Vector2( Math.round( this.layoutBounds.width * 0.295 ), Math.round( this.layoutBounds.height * 0.38 ) ),
      0.16 ); // This last parameter is a "Zoom factor" - smaller zooms out, larger zooms in.


    //// Nodes that hide and show the pie chart and mass indicator.
    //private final MaximizeControlNode pieChartWindow;
    //private final MaximizeControlNode averageAtomicMassWindow;

    // Map of the buckets in the model to their view representation.
    this.mapBucketToView = {};

    // Add the nodes that will allow the canvas to be layered.
    var controlsLayer = new Node();
    this.addChild( controlsLayer );
    var bucketHoleLayer = new Node();
    this.addChild( bucketHoleLayer );
    var chamberLayer = new Node();
    this.addChild( chamberLayer );
    var particleLayer = new Node();
    this.addChild( particleLayer );
    var bucketFrontLayer = new Node();
    this.addChild( bucketFrontLayer );

    // TODO Will port over soon
    //// Listen to the model for events that concern the canvas.
    //model.addListener( new MixIsotopesModel.Adapter() {
    //@Override
    //  public void isotopeInstanceAdded( final MovableAtom atom ) {
    //    // Add a representation of the new atom to the canvas.
    //    final LabeledIsotopeNode isotopeNode = new LabeledIsotopeNode( mvt, atom, model.getColorForIsotope( atom.getAtomConfiguration() ) );
    //    particleLayer.addChild( isotopeNode );
    //    atom.addListener( new SphericalParticle.Adapter() {
    //    @Override
    //      public void removedFromModel( SphericalParticle particle ) {
    //        particleLayer.removeChild( isotopeNode );
    //      }
    //    } );
    //    // Only allow interaction with the atoms when showing the
    //    // buckets and when not showing nature's mix.
    //    boolean interactiveParticles = model.getInteractivityModeProperty().get() == InteractivityMode.BUCKETS_AND_LARGE_ATOMS && !model.getShowingNaturesMixProperty().get();
    //    isotopeNode.setPickable( interactiveParticles );
    //    isotopeNode.setChildrenPickable( interactiveParticles );
    //  }
    //
    //        @Override
    //  public void isotopeBucketAdded( final MonoIsotopeParticleBucket bucket ) {
    //    final BucketView bucketView = new BucketView( bucket, mvt );
    //    bucketHoleLayer.addChild( bucketView.getHoleNode() );
    //    bucketFrontLayer.addChild( bucketView.getFrontNode() );
    //    mapBucketToView.put( bucket, bucketView );
    //  }
    //
    //        @Override
    //  public void isotopeBucketRemoved( final MonoIsotopeParticleBucket bucket ) {
    //    // Remove the representation of the bucket when the bucket
    //    // itself is removed from the model.
    //    if ( mapBucketToView.containsKey( bucket ) ) {
    //      bucketFrontLayer.removeChild( mapBucketToView.get( bucket ).getFrontNode() );
    //      bucketHoleLayer.removeChild( mapBucketToView.get( bucket ).getHoleNode() );
    //      mapBucketToView.remove( bucket );
    //    }
    //    else {
    //      System.out.println( getClass().getName() + "Warning: Attempt to remove bucket with no view component." );
    //    }
    //  }
    //
    //        @Override
    //  public void isotopeNumericalControllerAdded( final NumericalIsotopeQuantityControl controller ) {
    //    final IsotopeSliderNode controllerNode = new IsotopeSliderNode( controller, mvt );
    //    controlsLayer.addChild( controllerNode );
    //    controller.getPartOfModelProperty().addObserver( new SimpleObserver() {
    //      public void update() {
    //        if ( !controller.getPartOfModelProperty().get() ) {
    //          // Remove the representation of the bucket when the bucket
    //          // itself is removed from the model.
    //          controlsLayer.removeChild( controllerNode );
    //        }
    //      }
    //    }, false );
    //  }
    //} );

    // Add the test chamber into and out of which the individual isotopes
    // will be moved. As with all elements in this model, the shape and
    // position are considered to be two separate things.
    var testChamberNode = new Rectangle( this.modelViewTransform.modelToViewBounds( this.model.testChamber.getTestChamberRect() ), {
      fill: 'black',
      lineWidth: 1
    } );

    chamberLayer.addChild( testChamberNode );

    // Add the periodic table node that will allow the user to set the
    // current isotope.
    // TODO Continue porting
    //var periodicTableNode = new PeriodicTableNode( model, 18, BACKGROUND_COLOR ) {{
    //  setOffset( testChamberNode.getFullBoundsReference().getMaxX() + 15, testChamberNode.getFullBoundsReference().getMinY() );
    //  setScale( 1.1 ); // Empirically determined.
    //}};
    //controlsLayer.addChild( periodicTableNode );

    // Add the average atomic mass indicator to the canvas.
    //var averageAtomicMassIndicator = new AverageAtomicMassIndicator( model );
    //var averageAtomicMassWindow = new MaximizeControlNode( BuildAnAtomStrings.AVERAGE_ATOMIC_MASS, new PDimension( 400, 120 ), averageAtomicMassIndicator, true ) {{
    //  setOffset( indicatorWindowX, testChamberNode.getFullBoundsReference().getMaxY() - getFullBoundsReference().height );
    //  addChild( averageAtomicMassIndicator );
    //}}
    //controlsLayer.addChild( averageAtomicMassWindow );
    //averageAtomicMassIndicator.setOffset(
    //  averageAtomicMassWindow.getFullBoundsReference().width / 2 - averageAtomicMassIndicator.getFullBoundsReference().width / 2,
    //  30 /* Empirically determined, tweak as needed. */ );

  }

  return inherit( ScreenView, MixIsotopesScreenView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.
    }
  } );
} );
