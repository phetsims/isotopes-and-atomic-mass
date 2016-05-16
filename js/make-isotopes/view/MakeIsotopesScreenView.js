// Copyright 2014-2015, University of Colorado Boulder

/**
 * Screen view where the user makes isotopes of a given element by adding and removing neutrons.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */
define( function( require ) {
  'use strict';

  // modules
  var AccordionBox = require( 'SUN/AccordionBox' );
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var AtomScaleNode = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/view/AtomScaleNode' );
  var ExpandedPeriodicTableNode = require( 'SHRED/view/ExpandedPeriodicTableNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InteractiveIsotopeNode = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/view/InteractiveIsotopeNode' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ParticleCountDisplay = require( 'SHRED/view/ParticleCountDisplay' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SharedConstants = require( 'SHRED/SharedConstants' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TwoItemPieChartNode = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/view/TwoItemPieChartNode' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var NUMBER_FONT = new PhetFont( 70 );
  var NUMBER_INSET = 20; // In screen coords, which are roughly pixels.
  var SYMBOL_BOX_WIDTH = 275; // In screen coords, which are roughly pixels.
  var SYMBOL_BOX_HEIGHT = 300; // In screen coords, which are roughly pixels.

  // strings
  var symbolTitleString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/symbol.title' );
  var abundanceTitleString = require( 'string!ISOTOPES_AND_ATOMIC_MASS/abundance.title' );

  /**
   * @param {MakeIsotopesModel} makeIsotopesModel
   * @param {Tandem} tandem
   * @constructor
   */
  function MakeIsotopesScreenView( makeIsotopesModel, tandem ) {
    // super type constructor
    ScreenView.call( this, { layoutBounds: SharedConstants.LAYOUT_BOUNDS } );

    // Set up the model-canvas transform.  IMPORTANT NOTES: The multiplier factors for the point in the view can be
    // adjusted to shift the center right or left, and the scale factor can be adjusted to zoom in or out (smaller
    // numbers zoom out, larger ones zoom in).
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping( Vector2.ZERO,
      new Vector2( Util.roundSymmetric( this.layoutBounds.width * 0.4 ),
        Util.roundSymmetric( this.layoutBounds.height * 0.49 ) ),
      1.0
    );

    // Layers upon which the various display elements are placed. This allows us to create the desired layering effects.
    var indicatorLayer = new Node();
    this.addChild( indicatorLayer );
    //adding this layer later so that its on the top
    var atomLayer = new Node();

    // Create and add the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
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
    var scaleNode = new AtomScaleNode( makeIsotopesModel.particleAtom );

    // The scale needs to sit just below the atom, and there are some "tweak factors" needed to get it looking right.
    scaleNode.setCenterBottom( new Vector2( this.modelViewTransform.modelToViewX( 0 ), this.bottom ) );
    this.addChild( scaleNode );

    // Create the node that contains both the atom and the neutron bucket.
    var bottomOfAtomPosition = new Vector2( scaleNode.centerX, scaleNode.top + 15 ); //empirically determined

    var atomAndBucketNode = new InteractiveIsotopeNode( makeIsotopesModel, this.modelViewTransform, bottomOfAtomPosition );
    atomLayer.addChild( atomAndBucketNode );

    // Add the interactive periodic table that allows the user to select the current element.  Heaviest interactive
    // element is Neon for this sim.
    var periodicTableNode = new ExpandedPeriodicTableNode( makeIsotopesModel.numberAtom, 10, {
      tandem: tandem
    } );
    periodicTableNode.scale( 0.65 );
    periodicTableNode.top = 10;
    periodicTableNode.right = this.layoutBounds.width - 10;
    this.addChild( periodicTableNode );

    // Add the legend/particle count indicator.
    var particleCountLegend = new ParticleCountDisplay( makeIsotopesModel.particleAtom, 13, 250 );
    particleCountLegend.scale( 1.1 );
    particleCountLegend.left = 20;
    particleCountLegend.top = periodicTableNode.visibleBounds.minY;
    indicatorLayer.addChild( particleCountLegend );

    var symbolRectangle = new Rectangle( 0, 0, SYMBOL_BOX_WIDTH, SYMBOL_BOX_HEIGHT, 0, 0, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 2
    } );

    // Add the symbol text.
    var symbolText = new Text( '', {
      font: new PhetFont( 150 ),
      fill: 'black',
      center: new Vector2( symbolRectangle.width / 2, symbolRectangle.height / 2 )
    } );

    // Add the listener to update the symbol text.
    var textCenter = new Vector2( symbolRectangle.width / 2, symbolRectangle.height / 2 );
    // Doesn't need unlink as it stays through out the sim life
    makeIsotopesModel.particleAtom.protonCountProperty.link( function( protonCount ) {
      var symbol = AtomIdentifier.getSymbol( protonCount );
      symbolText.text = protonCount > 0 ? symbol : '';
      symbolText.center = textCenter;
    } );
    symbolRectangle.addChild( symbolText );

    // Add the proton count display.
    var protonCountDisplay = new Text( '0', {
      font: NUMBER_FONT,
      fill: 'red'
    } );
    symbolRectangle.addChild( protonCountDisplay );

    // Add the listener to update the proton count.
    // Doesn't need unlink as it stays through out the sim life
    makeIsotopesModel.particleAtom.protonCountProperty.link( function( protonCount ) {
      protonCountDisplay.text = protonCount;
      protonCountDisplay.left = NUMBER_INSET;
      protonCountDisplay.bottom = SYMBOL_BOX_HEIGHT - NUMBER_INSET;
    } );

    // Add the mass number display.
    var massNumberDisplay = new Text( '0', {
      font: NUMBER_FONT,
      fill: 'black'
    } );
    symbolRectangle.addChild( massNumberDisplay );

    // Add the listener to update the mass number.
    // Doesn't need unlink as it stays through out the sim life
    makeIsotopesModel.particleAtom.massNumberProperty.link( function( massNumber ) {
      massNumberDisplay.text = massNumber;
      massNumberDisplay.left = NUMBER_INSET;
      massNumberDisplay.top = NUMBER_INSET;
    } );

    symbolRectangle.scale( 0.20 );
    var symbolBox = new AccordionBox( symbolRectangle, {
      titleNode: new Text( symbolTitleString, {
        font: SharedConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: SharedConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      } ),
      fill: SharedConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property( false ),
      minWidth: periodicTableNode.visibleBounds.width,
      maxWidth: periodicTableNode.visibleBounds.width,
      contentAlign: 'center',
      titleAlignX: 'left',
      buttonAlign: 'right',
      buttonTouchAreaXDilation: 16,
      buttonTouchAreaYDilation: 16
    } );
    symbolBox.left = periodicTableNode.visibleBounds.minX;
    symbolBox.top = periodicTableNode.bottom + 10;
    this.addChild( symbolBox );

    var abundanceBox = new AccordionBox( new TwoItemPieChartNode( makeIsotopesModel ), {
      titleNode: new Text( abundanceTitleString, {
        font: SharedConstants.ACCORDION_BOX_TITLE_FONT,
        maxWidth: SharedConstants.ACCORDION_BOX_TITLE_MAX_WIDTH
      } ),
      fill: SharedConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
      expandedProperty: new Property( false ),
      minWidth: periodicTableNode.visibleBounds.width,
      maxWidth: periodicTableNode.visibleBounds.width,
      contentAlign: 'center',
      contentXMargin: 0,
      titleAlignX: 'left',
      buttonAlign: 'right',
      buttonTouchAreaXDilation: 16,
      buttonTouchAreaYDilation: 16
    } );
    abundanceBox.left = symbolBox.left;
    abundanceBox.top = symbolBox.bottom + 10;
    this.addChild( abundanceBox );
    this.addChild( atomLayer );
  }

  isotopesAndAtomicMass.register( 'MakeIsotopesScreenView', MakeIsotopesScreenView );
  return inherit( ScreenView, MakeIsotopesScreenView );
} );

