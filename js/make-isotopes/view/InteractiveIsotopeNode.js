// Copyright 2002-2014, University of Colorado Boulder

/**
 * This class defines a Node that represents an atom in "schematic" (i.e. Bohr) form and allows users to add or remove
 * neutrons from/to a bucket in order to create different isotopes of a particular atom.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */


define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var BucketHole = require( 'SCENERY_PHET/bucket/BucketHole' );
  var BucketFront = require( 'SCENERY_PHET/bucket/BucketFront' );
  var ParticleNode = require( 'SHRED/view/ParticleNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var ParticleView = require( 'SHRED/view/ParticleView' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var BucketDragHandler = require( 'SHRED/view/BucketDragHandler' );
  var IsotopeElectronCloudNode = require( 'ISOTOPES_AND_ATOMIC_MASS/make-isotopes/view/IsotopeElectronCloudNode' );

  var NUM_NUCLEON_LAYERS = 5; // This is based on max number of particles, may need adjustment if that changes.

  /**
   * Constructor for an InteractiveIsotopeNode
   * @param makeIsotopesModel
   * @param modelViewTransform
   * @param bottomPoint
   * @constructor
   */
  function InteractiveIsotopeNode( makeIsotopesModel, modelViewTransform, bottomPoint ) {

    // supetype constructor
    Node.call( this );
    var thisView = this;
    this.modelViewTransform = modelViewTransform; // extend scope of modelViewTransform.

    // Add the bucket components that hold the neutrons.
    var neutronBucketHole = new BucketHole( makeIsotopesModel.neutronBucket, modelViewTransform );
    var neutronBucketFront = new BucketFront( makeIsotopesModel.neutronBucket, modelViewTransform );
    neutronBucketFront.addInputListener( new BucketDragHandler( makeIsotopesModel.neutronBucket, modelViewTransform) );

    // Bucket hole is first item added to view for proper layering.
    this.addChild( neutronBucketHole );

    // Add the layers where the nucleons will be maintained.
    var nucleonLayers = [];
    _.times( NUM_NUCLEON_LAYERS, function() {
      var nucleonLayer = new Node();
      nucleonLayers.push( nucleonLayer );
      thisView.addChild( nucleonLayer );
    } );
    nucleonLayers.reverse(); // Set up the nucleon layers so that layer 0 is in front.

    // Add the nucleon particle views.
    // Create array of nucleons which contains both protons and neutrons.
    var nucleons = makeIsotopesModel.protons.concat( makeIsotopesModel.neutrons );
    nucleons.forEach( function( nucleon ) {
      var particleView = new ParticleView( nucleon, thisView.modelViewTransform );
      // If the particle is a proton, the user should not be able to interact with it.
      if( nucleon.type === 'proton' ){
        particleView.pickable = false;
      }

      nucleonLayers[nucleon.zLayer].addChild( particleView );

      // Add a listener that adjusts a nucleon's z-order layering.
      nucleon.zLayerProperty.link( function( zLayer ) {
        assert && assert( nucleonLayers.length > zLayer, "zLayer for nucleon exceeds number of layers, max number may need increasing." );
        // Determine whether nucleon view is on the correct layer.
        var onCorrectLayer = false;
        nucleonLayers[zLayer].children.forEach( function( particleView ) {
          if ( particleView.particle === nucleon ) {
            onCorrectLayer = true;
          }
        } );

        if ( !onCorrectLayer ) {

          // Remove particle view from its current layer.
          var particleView = null;
          for ( var layerIndex = 0; layerIndex < nucleonLayers.length && particleView === null; layerIndex++ ) {
            for ( var childIndex = 0; childIndex < nucleonLayers[layerIndex].children.length; childIndex++ ) {
              if ( nucleonLayers[layerIndex].children[childIndex].particle === nucleon ) {
                particleView = nucleonLayers[layerIndex].children[childIndex];
                nucleonLayers[layerIndex].removeChildAt( childIndex );
                break;
              }
            }
          }

          // Add the particle view to its new layer.
          assert && assert( particleView !== null, "Particle view not found during relayering" );
          nucleonLayers[ zLayer ].addChild( particleView );
        }
      } );
    } );

    // Add the neutron bucket child here for proper layering with neutrons.
    this.addChild( neutronBucketFront );

    // Add the isotope electron cloud.
    var isotopeElectronCloudNode = new IsotopeElectronCloudNode( makeIsotopesModel.particleAtom, modelViewTransform );
    this.addChild( isotopeElectronCloudNode );

  }

  return inherit( Node, InteractiveIsotopeNode, {



//    protected void addNeutronNode( final Neutron neutron ) {
//    // Create the node to represent this particle.
//    final NeutronNode neutronNode = new NeutronNode( mvt, neutron );

//
//
//    // Add the new node to the appropriate layer.
//    nucleusLayers.get( mapNucleonToLayerNumber( neutron ) ).addChild( neutronNode );
//  }

    /**
     * Add a neutron to this atom representation.  Note that this method is sometimes used to add a particle that is
     * actually external to the atom but that may, over the course of its life, be moved into the atom.
     *
     * @param {ParticleNode} neutron
     */
//    addNeutronNode: function( neutron ) {
//      // Create the node to represent this particle.
//      var neutronNode = new ParticleView( neutron, this.modelViewTransform );
//
//      // Set up the removal of this particle's representation when the
//      // particle itself is removed.
////    neutron.addListener( new SphericalParticle.Adapter() {
////      @Override
////      public void removedFromModel( SphericalParticle particle ) {
////        removeNucleonNodeFromLayers( neutronNode );
////        neutron.removeListener( this );
////      }
////    } );
//
//      // TODO: add removal listener
//      this.addChild( neutronNode );
//
//    }
  } );

} );
//public class InteractiveIsotopeNode extends SchematicAtomNode {
//
//  /**
//   * Constructor.
//   */
//  public InteractiveIsotopeNode( final MakeIsotopesModel model, final ModelViewTransform mvt, final Point2D bottomPoint ) {
//    super( model.getAtom(), mvt, new Property<OrbitalView>( OrbitalView.ISOTOPES_RESIZING_CLOUD ), false, true, false );
//
//    model.addListener( new MakeIsotopesModel.Adapter() {
//      @Override
//      public void particleAdded( SphericalParticle subatomicParticle ) {
//        addParticleNode( subatomicParticle );
//      }
//    } );
//
//    // Add the bucket that holds the neutrons.
//    BucketView neutronBucketNode = new BucketView( model.getNeutronBucket(), mvt );
//    electronShellLayer.addChild( neutronBucketNode.getHoleNode() );
//    frontLayer.addChild( neutronBucketNode.getFrontNode() );
//    for ( SphericalParticle neutron : model.getNeutronBucket().getParticleList() ) {
//      // Add these particles to the atom representation even though they
//      // are outside of the atom, since they may well be added to the
//      // atom later.
//      addNeutronNode( (Neutron) neutron );
//    }
//
//    // Add the handler that keeps the bottom of the atom in one place.
//    // This was added due to a request to make the atom get larger and
//    // smaller but to stay on the scale.
//    getIsotopeElectronCloudNode().addPropertyChangeListener( PROPERTY_FULL_BOUNDS, new PropertyChangeListener() {
//      public void propertyChange( PropertyChangeEvent evt ) {
//        model.getAtom().setPosition( mvt.viewToModel( bottomPoint.getX(),
//            bottomPoint.getY() - getIsotopeElectronCloudNode().getFullBoundsReference().height / 2 ) );
//      }
//    } );
//  }
//
//  /**
//   * Get the cloud radius in screen coords.  This ignores all but the
//   * isotope cloud in the parent class.
//   */
//  public double getCloudRadius() {
//    return getIsotopeElectronCloudNode().getFullBoundsReference().height / 2;
//  }
//
//  public void addElectronCloudBoundsChangeListener( PropertyChangeListener listener ) {
//    getIsotopeElectronCloudNode().addPropertyChangeListener( PROPERTY_FULL_BOUNDS, listener );
//  }
//}
