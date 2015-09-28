package com.joshmonson.dmxserver.activation

import com.joshmonson.dmxserver.sequence.CueEvent
import com.juanjo.openDmx.OpenDmx

/**
 * Created by josh on 9/8/15.
 */
object DmxActivator extends Activator {

  val dmxEnabled = System.getProperty("os.name").toLowerCase match {
    case s if s.startsWith("win") =>
      if (!OpenDmx.connect(OpenDmx.OPENDMX_TX)) {
        println("Open DMX Not connected!")
        false
      } else
        true
    case _ =>
      println("Not using windows. DMX not enabled.")
      false
  }


  override def apply(time: Double, offset: Int): (CueEvent) => Unit =
    cue => {
      if (dmxEnabled) {
        OpenDmx.setValue(cue.channel + offset, (cue.getValue(time) * 2.55).toInt)
      }
    }
}
