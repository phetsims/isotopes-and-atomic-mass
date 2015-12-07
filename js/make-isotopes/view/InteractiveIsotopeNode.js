// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class defines a Node that represents an atom in "schematic" (i.e. Bohr) form and allows users to add or remove
 * neutrons from/to a bucket in order to create different isotopes of a particular atom.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */


define( function( require ) {
  'use strict';

  // modules
  var AtomIdentifier = require( 'SHRED/AtomIdentifier' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var ParticleView = require( 'SHRED/view/ParticleView' );
  var BucketDragHandler = require( 'SHRED/view/BucketDragHandler' );
  var isotopesAndAtomicMass = require( 'ISOTOPES_AND_ATOMIC_MASS/isotopesAndAtomicMass' );
  var IsotopeAtomNode = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/view/IsotopeAtomNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var stableString = require( 'string!SHRED/stable' );
  var unstableString = require( 'string!SHRED/unstable' );

  // constants
  var NUM_NUCLEON_LAYERS = 5; // This is based on max number of particles, may need adjustment if that changes.
  var ELEMENT_NAME_FONT_SIZE = 16;

  /**
   * Constructor for an InteractiveIsotopeNode
   * @param {MakeIsotopesModel} makeIsotopesModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Vector2} bottomPoint
   * @constructor
   */
  function InteractiveIsotopeNode( makeIsotopesModel, modelViewTransform, bottomPoint ) {

    // supetype constructor
    Node.call( this );
    var thisNode = this;
    this.modelViewTransform = modelViewTransform; // extend scope of modelViewTransform.

    // Add the node that shows the textual labels and electron cloud.
    // TODO: bottomPoint should not be passed in this way.  Refactor soon.
    var isotopeAtomNode = new IsotopeAtomNode( makeIsotopesModel.particleAtom, makeIsotopesModel.numberAtom, bottomPoint, modelViewTransform );
    this.addChild( isotopeAtomNode );

    // Add the bucket components that hold the neutrons.
    var neutronBucketHole = new BucketHole( makeIsotopesModel.neutronBucket, modelViewTransform );
    var neutronBucketFront = new BucketFront( makeIsotopesModel.neutronBucket, modelViewTransform );
    neutronBucketFront.addInputListener( new BucketDragHandler( makeIsotopesModel.neutronBucket, neutronBucketFront, modelViewTransform ) );

    // Bucket hole is first item added to view for proper layering.
    this.addChild( neutronBucketHole );

    // Add the layers where the nucleons will be maintained.
    var nucleonLayersNode = new Node();
    var nucleonLayers = [];
    _.times( NUM_NUCLEON_LAYERS, function() {
      var nucleonLayer = new Node();
      nucleonLayers.push( nucleonLayer );
      nucleonLayersNode.addChild( nucleonLayer );
    } );
    nucleonLayers.reverse(); // Set up the nucleon layers so that layer 0 is in front.
    thisNode.addChild( nucleonLayersNode );

    // Function to adjust z-layer ordering for a particle. This is to be linked to the particle's zLayer property.
    var adjustZLayer = function( addedAtom, zLayer ) {
      assert && assert( nucleonLayers.length > zLayer, 'zLayer for proton exceeds number of layers, max number may need increasing.' );
      // Determine whether proton view is on the correct layer.
      var onCorrectLayer = false;
      nucleonLayers[ zLayer ].children.forEach( function( particleView ) {
        if ( particleView.particle === addedAtom ) {
          onCorrectLayer = true;
        }
      } );
      if ( !onCorrectLayer ) {
        // Remove particle view from its current layer.
        var particleView = null;
        for ( var layerIndex = 0; layerIndex < nucleonLayers.length && particleView === null; layerIndex++ ) {
          for ( var childIndex = 0; childIndex < nucleonLayers[ layerIndex ].children.length; childIndex++ ) {
            if ( nucleonLayers[ layerIndex ].children[ childIndex ].particle === addedAtom ) {
              particleView = nucleonLayers[ layerIndex ].children[ childIndex ];
              nucleonLayers[ layerIndex ].removeChildAt( childIndex );
              break;
            }
          }
        }
        // Add the particle view to its new layer.
        assert && assert( particleView !== null, 'Particle view not found during relayering' );
        nucleonLayers[ zLayer ].addChild( particleView );
      }
    };

    // function to add the view for a nucleon, i.e. a proton or neutron
    function addParticleView( addedParticle ) {
      assert && assert( addedParticle.type === 'proton' || addedParticle.type === 'neutron', 'unrecognized particle type' );

      var particleView = new ParticleView( addedParticle, thisNode.modelViewTransform );
      particleView.center = thisNode.modelViewTransform.modelToViewPosition( addedParticle.position );
      particleView.pickable = addedParticle.type === 'neutron';

      // add particle view to correct z layer.
      nucleonLayers[ addedParticle.zLayer ].addChild( particleView );
      // Add a listener that adjusts a nucleon's z-order layering.
      addedParticle.zLayerProperty.link( function( zLayer ) {
        adjustZLayer( addedParticle, zLayer );
      } );

      // Add the item removed listener.
      var temp;
      if ( addedParticle.type === 'proton' ) {
        temp = makeIsotopesModel.protons;
      }
      else if ( addedParticle.type === 'neutron' ) {
        temp = makeIsotopesModel.neutrons;
      }

      temp.addItemRemovedListener( function removalListener( removedAtom ) {
        if ( removedAtom === addedParticle ) {
          nucleonLayers[ addedParticle.zLayer ].removeChild( particleView );
          temp.removeItemRemovedListener( removalListener );
        }
      } );
    }

    makeIsotopesModel.protons.forEach( function( proton ) { addParticleView( proton ); } );

    makeIsotopesModel.neutrons.forEach( function( neutron ) { addParticleView( neutron ); } );

    // add the item added listeners for particles of this isotope
    makeIsotopesModel.protons.addItemAddedListener( function( addedAtom ) { addParticleView( addedAtom );} );

    // add the item added listeners for particles of this isotope
    makeIsotopesModel.neutrons.addItemAddedListener( function( addedAtom ) { addParticleView( addedAtom );} );

    // Add the neutron bucket child here for proper layering with neutrons.
    this.addChild( neutronBucketFront );

    // Create the textual readout for the element name.
    var elementName = new Text( '', { font: new PhetFont( { size: ELEMENT_NAME_FONT_SIZE, weight: 'bold' } ) } );
    this.addChild( elementName );

    // Define the update function for the element name.
    var updateElementName = function( numProtons, numNeutrons ) {
      // get element name and append mass number to identify isotope
      var name = AtomIdentifier.getName( numProtons ) + '-' + ( numProtons + numNeutrons );
      if ( name.length === 0 ) {
        name = '';
      }
      elementName.text = name;
      elementName.center = new Vector2( isotopeAtomNode.centerX, nucleonLayersNode.top - 20 );
    };

    // Create the textual readout for the stability indicator.
    var stabilityIndicator = new Text( '', { font: new PhetFont( { size: 12, weight: 'bold' } ) } );
    this.addChild( stabilityIndicator );

    // Define the update function for the stability indicator.
    var updateStabilityIndicator = function( numProtons, numNeutrons ) {
      var stabilityIndicatorCenterPos = new Vector2( isotopeAtomNode.centerX, isotopeAtomNode.centerY + (isotopeAtomNode.centerY - nucleonLayersNode.top) + 15 );
      if ( numProtons > 0 ) {
        if ( AtomIdentifier.isStable( numProtons, numNeutrons ) ) {
          stabilityIndicator.text = stableString;
        }
        else {
          stabilityIndicator.text = unstableString;
        }
      }
      else {
        stabilityIndicator.text = '';
      }
      //thisAtomView.stabilityIndicator.maxWidth = 2 * Math.sqrt( (isotopeElectronCloud.radius * isotopeElectronCloud.radius) - (isotopeElectronCloud.radius * 0.53 * isotopeElectronCloud.radius * 0.53 ) );
      stabilityIndicator.center = stabilityIndicatorCenterPos;
    };

    makeIsotopesModel.on( 'atomReconfigured', function() {
      updateElementName( makeIsotopesModel.particleAtom.protonCount, makeIsotopesModel.particleAtom.neutronCount );
      updateStabilityIndicator( makeIsotopesModel.particleAtom.protonCount, makeIsotopesModel.particleAtom.neutronCount );
    } );

    // initial update
    updateElementName( makeIsotopesModel.particleAtom.protonCount, makeIsotopesModel.particleAtom.neutronCount );
    updateStabilityIndicator( makeIsotopesModel.particleAtom.protonCount, makeIsotopesModel.particleAtom.neutronCount );
  }

  isotopesAndAtomicMass.register( 'InteractiveIsotopeNode', InteractiveIsotopeNode );
  return inherit( Node, InteractiveIsotopeNode, {} );
} );