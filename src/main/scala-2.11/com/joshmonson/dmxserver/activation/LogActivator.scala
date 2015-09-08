package com.joshmonson.dmxserver.activation

import com.joshmonson.dmxserver.sequence.CueEvent


object LogActivator extends Activator {
  override def apply(time: Double): (CueEvent) => Unit =
    cue => {
      val str = f"[$time%3.1f]  #${cue.channel} > ${cue.getValue(time)}%3.1f"
      println(str)
    }
}
