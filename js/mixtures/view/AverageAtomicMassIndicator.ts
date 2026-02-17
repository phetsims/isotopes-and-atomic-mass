// Copyright 2015-2026, University of Colorado Boulder

/**
 * monitors the average atomic mass of a set of isotopes in a model and displays it.
 *
 * @author John Blanco
 * @author James Smith
 * @author Aadish Gupta
 *
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Panel from '../../../../sun/js/Panel.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';
import MixturesModel from '../model/MixturesModel.js';
import NucleusConfig from '../model/NucleusConfig.js';

// constants
const INDICATOR_WIDTH = 200;
const TICK_MARK_LINE_HEIGHT = 15;
const TICK_MARK_LINE_WIDTH = 5;
const SIZE = new Dimension2( 75, 25 );
const TRIANGULAR_POINTER_HEIGHT = 15;
const TRIANGULAR_POINTER_WIDTH = 20;
const NUMBER_DECIMALS = 5;

const amuString = IsotopesAndAtomicMassStrings.amu;

/**
 * Convenience function for creating tick marks. This includes both the actual mark and the label.
 */
function IsotopeTickMark( isotopeConfig: NucleusConfig ): Node {
  const node = new Node();

  // Create the tick mark itself.  It is positioned such that (0,0) is the center of the mark.
  const shape = new Line( 0, -TICK_MARK_LINE_HEIGHT / 2, 0, TICK_MARK_LINE_HEIGHT / 2, {
    lineWidth: TICK_MARK_LINE_WIDTH,
    stroke: 'black'
  } );
  node.addChild( shape );

  // Create the label that goes above the tick mark.
  const label = new RichText(
    ` <sup>${isotopeConfig.getMassNumber()}</sup>${AtomIdentifier.getSymbol( isotopeConfig.protonCount )}`,
    {
      font: new PhetFont( 12 )
    }
  );
  label.centerX = shape.centerX;
  label.bottom = shape.top;
  node.addChild( label );

  return node;
}

/**
 * This convenience defines the "readout pointer", which is an indicator that contains a textual indication of the
 * average atomic mass and also has a pointer on the top that can be used to indicate the position on a linear scale.
 * This node is set up such that the (0,0) point is at the top center of the node, which is where the point of the
 * pointer exists. This is done to make it easy to position the node under the mass indication line.
 */
function ReadoutPointer( model: MixturesModel ): Node {
  const node = new Node();

  // Add the triangular pointer. This is created such that the point of the triangle is at (0,0) for this node.
  const vertices = [
    new Vector2( -TRIANGULAR_POINTER_WIDTH / 2, TRIANGULAR_POINTER_HEIGHT ),
    new Vector2( TRIANGULAR_POINTER_WIDTH / 2, TRIANGULAR_POINTER_HEIGHT ),
    new Vector2( 0, 0 )
  ];

  const triangle = new Path( Shape.polygon( vertices ), {
    fill: new Color( 0, 143, 212 ),
    lineWidth: 1
  } );
  node.addChild( triangle );

  const readoutText = new Text( '', {
    font: new PhetFont( 14 ),
    maxWidth: 0.9 * SIZE.width,
    maxHeight: 0.9 * SIZE.height
  } );

  const readoutPanel = new Panel( readoutText, {
    minWidth: SIZE.width,
    minHeight: SIZE.height,
    resize: false,
    cornerRadius: 2,
    lineWidth: 1,
    align: 'center',
    fill: 'white'
  } );

  readoutPanel.top = triangle.bottom;
  readoutPanel.centerX = triangle.centerX;
  node.addChild( readoutPanel );

  function updateReadout( averageAtomicMass: number ): void {
    let weight: number;
    if ( model.showingNaturesMixProperty.get() ) {
      weight = AtomIdentifier.getStandardAtomicMass( model.selectedElementProtonCountProperty.value );
    }
    else {
      weight = averageAtomicMass;
    }
    readoutText.setString( `${toFixed( weight, NUMBER_DECIMALS )} ${amuString}` );
    readoutText.centerX = SIZE.width / 2;
  }

  // Observe the average atomic weight property in the model and update the textual readout whenever it changes.
  // Doesn't need unlink as it stays through out the sim life
  model.testChamber.averageAtomicMassProperty.link( ( averageAtomicMass: number ) => {
    updateReadout( averageAtomicMass );
  } );

  return node;
}

class AverageAtomicMassIndicator extends Node {

  private minMass: number = Number.POSITIVE_INFINITY;
  private massSpan = 2;

  /**
   * @param model - The MixturesModel instance
   */
  public constructor( model: MixturesModel ) {
    super();

    // Add the bar that makes up "spine" of the indicator.
    const barNode = new Line( 0, 0, INDICATOR_WIDTH, 0, {
      lineWidth: 3,
      stroke: 'black'
    } );
    this.addChild( barNode );

    // Add the layer where the tick marks will be maintained.
    const tickMarkLayer = new Node();
    this.addChild( tickMarkLayer );

    // Listen for changes to the list of possible isotopes and update the tick marks when changes occur.
    // Doesn't need unlink as it stays through out the sim life
    model.possibleIsotopesProperty.link( () => {
      tickMarkLayer.removeAllChildren();
      const possibleIsotopesList = model.possibleIsotopesProperty.get();
      let lightestIsotopeMass = Number.POSITIVE_INFINITY;
      let heaviestIsotopeMass = 0;
      this.minMass = Number.POSITIVE_INFINITY;
      possibleIsotopesList.forEach( isotope => {
        const mass = isotope.getAtomicMass();
        if ( mass > heaviestIsotopeMass ) {
          heaviestIsotopeMass = mass;
        }
        if ( mass < lightestIsotopeMass ) {
          lightestIsotopeMass = mass;
        }
      } );

      this.massSpan = heaviestIsotopeMass - lightestIsotopeMass;
      if ( this.massSpan < 2 ) {
        this.massSpan = 2; // Mass span must be at least 2 or the spacing doesn't look good.
      }
      // Adjust the span so that there is some space at the ends of the line.
      this.massSpan *= 1.2;
      // Set the low end of the mass range, needed for positioning on line.
      this.minMass = ( heaviestIsotopeMass + lightestIsotopeMass ) / 2 - this.massSpan / 2;

      // Add the new tick marks.
      model.possibleIsotopesProperty.get().forEach( isotope => {
        const tickMark = IsotopeTickMark( isotope );
        tickMark.centerX = this.calcXOffsetFromAtomicMass( isotope.getAtomicMass() );
        tickMarkLayer.addChild( tickMark );
      } );
    } );

    // Add the moving readout.
    const readoutPointer = ReadoutPointer( model );
    readoutPointer.top = barNode.bottom;
    readoutPointer.centerX = barNode.centerX;
    this.addChild( readoutPointer );

    // Doesn't need unlink as it stays through out the sim life
    model.testChamber.averageAtomicMassProperty.link( ( averageAtomicMass: number ) => {
      if ( model.testChamber.isotopeCountProperty.get() > 0 ) {
        readoutPointer.centerX = this.calcXOffsetFromAtomicMass( averageAtomicMass );
        readoutPointer.setVisible( true );
      }
      else {
        readoutPointer.setVisible( false );
      }
    } );
  }

  /**
   * Calculate the X offset on the bar given the atomic mass. This is clamped to never return a value less than 0.
   */
  public calcXOffsetFromAtomicMass( atomicMass: number ): number {
    return Math.max( ( ( atomicMass - this.minMass ) / this.massSpan ) * INDICATOR_WIDTH, 0 );
  }
}

isotopesAndAtomicMass.register( 'AverageAtomicMassIndicator', AverageAtomicMassIndicator );
export default AverageAtomicMassIndicator;