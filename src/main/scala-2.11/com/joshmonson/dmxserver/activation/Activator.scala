package com.joshmonson.dmxserver.activation

import com.joshmonson.dmxserver.sequence.CueEvent


trait Activator extends ((Double, Int) => CueEvent => Unit) {}
