// Copyright 2002-2014, University of Colorado Boulder

/**
 * This class defines a Piccolo Node that represents an atom in "schematic"
 * (i.e. Bohr) form and allows users to add or remove neutrons from/to a
 * bucket in order to create different isotopes of a particular atom.
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
    var thisNode = this;
    this.modelViewTransform = modelViewTransform;

    // Add the bucket that holds the neutrons.  Bucket hole gets added first for proper layering.
    var neutronBucketHole = new BucketHole( makeIsotopesModel.neutronBucket, modelViewTransform );
    var neutronBucketFront = new BucketFront( makeIsotopesModel.neutronBucket, modelViewTransform );
    neutronBucketFront.addInputListener( new BucketDragHandler( makeIsotopesModel.neutronBucket, modelViewTransform) );

    this.addChild( neutronBucketHole );

    // Iterate through the neutrons and add to the view.
    _.each( makeIsotopesModel.neutronBucket.getParticleList(), function( neutron ) {
      thisNode.addNeutronNode( neutron );
    } );

    // Move the front of the Neutron Bucket to the front for proper layering with neutrons.
    this.addChild( neutronBucketFront );

    var centerCheck = new Circle( 5, {fill: 'red' } );
    centerCheck.center = this.center;
    this.addChild( centerCheck );


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
    addNeutronNode: function( neutron ) {
      // Create the node to represent this particle.
      var neutronNode = new ParticleView( neutron, this.modelViewTransform );

      // Set up the removal of this particle's representation when the
      // particle itself is removed.
//    neutron.addListener( new SphericalParticle.Adapter() {
//      @Override
//      public void removedFromModel( SphericalParticle particle ) {
//        removeNucleonNodeFromLayers( neutronNode );
//        neutron.removeListener( this );
//      }
//    } );

      // TODO: add removal listener
      this.addChild( neutronNode );

    }
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
