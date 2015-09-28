package com.joshmonson.dmxserver.activation

import com.joshmonson.dmxserver.sequence.CueEvent

/**
 * Created by josh on 9/8/15.
 */
object AggregateActivator extends Activator {

  val activators = List(
    DmxActivator,
    LogActivator
  )

  override def apply(time: Double, offset: Int): (CueEvent) => Unit =
    (cue) => activators.foreach(_(time, offset)(cue))
}
