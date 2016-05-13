# Isotopes and Atomic Mass

This document describes the model for the Isotopes and Atomic Mass simulation.<br>
@author Aadish Gupta

In the Isotopes and Atomic simulation, different isotopes for the elements are constructed by removing or adding neutrons
from the nucleus of the atom. The particles are not at all to scale. This was done to make it so that the particles
could be easily seen and manipulated by the users. Neutrons can only be placed in the nucleus. Trying to place neutrons
well outside the nucleus causes the particle to return to its bucket.
The chemical element is determined by the number of protons in the nucleus and abundance in nature based on number of neutrons.

Number of elements for the first screen is limited to 10 elements

The second screen allows to create different composition of isotopes for an element and also see the nature's composition
for that element.

Number of elements for the second screen is limited to 18 elements

Stability of a nucleus is marked as "Stable" or "Unstable", and will cause unstable nuclei to move about randomly.
This setting is off by default in order to minimize distraction. Unstable nuclei do not break apart, i.e. nuclear decay
is not depicted.  A nucleus is considered stable if it has a half life greater than 10 billion years.
