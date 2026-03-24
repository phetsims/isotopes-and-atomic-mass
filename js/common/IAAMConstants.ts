// Copyright 2026, University of Colorado Boulder

/**
 * IAAMConstants defines constants that are used throughout this simulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import ShredConstants from '../../../shred/js/ShredConstants.js';
import { AccordionBoxOptions } from '../../../sun/js/AccordionBox.js';

const ACCORDION_BOX_OPTIONS: AccordionBoxOptions = {
  cornerRadius: 3,
  fill: ShredConstants.DISPLAY_PANEL_BACKGROUND_COLOR,
  contentAlign: 'center',
  titleAlignX: 'left',
  expandCollapseButtonOptions: {
    touchAreaXDilation: 12,
    touchAreaYDilation: 12
  },
  resize: false
};

const IAAMConstants = {

  ACCORDION_BOX_OPTIONS: ACCORDION_BOX_OPTIONS

};

export default IAAMConstants;
