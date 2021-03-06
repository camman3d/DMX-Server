package com.joshmonson.dmxserver.activation

import com.joshmonson.dmxserver.sequence.CueEvent


object LogActivator extends Activator {
  override def apply(time: Double, offset: Int, persist: Boolean): (CueEvent) => Unit =
    cue => {
      val str = f"[$time%3.1f]  #${cue.channel + offset} > ${cue.getValue(time, persist)}%3.1f"
      println(str)
    }
}
