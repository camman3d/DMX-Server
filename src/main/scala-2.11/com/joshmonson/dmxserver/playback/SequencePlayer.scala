package com.joshmonson.dmxserver.playback

import java.io.File

import com.joshmonson.dmxserver.activation.AggregateActivator
import com.joshmonson.dmxserver.audio.{AudioPreloader, AudioDriver}
import com.joshmonson.dmxserver.sequence.{CueEvent, DmxSequence}

/**
 * Created by josh on 9/7/15.
 */
object SequencePlayer {

  def getTimeDriver(seq: DmxSequence, id: String): TimeDriver =
    seq.media
      .map(m => AudioPreloader.getAudioDriver(m, seq.duration, id))
      .getOrElse(new SimpleTimeDriver(seq.duration, id = id))

  def play(seq: DmxSequence, offset: Int = 0): Unit = {
    println(s"${seq.name} - Start")
    val id = seq.name + offset
    val timeDriver = getTimeDriver(seq, id)
    val deltaClock = seq.toDeltaClock
    var active: Vector[CueEvent] = Vector()

    var prevTime = 0.0
    timeDriver.play {
      case UpdateEvent(time) =>
        // Update delta clock, possibly pulling off entries and moving them to the active stack
        val dt = time - prevTime
        prevTime = time
        active ++= deltaClock.update(dt)

        // Activate everything on active stack
        active.foreach(AggregateActivator(time, offset, seq.persist))

        // See if anything on the active stack needs to be removed.
        active = active.filter(_.end.time >= time)
      case DoneEvent() =>
        if (seq.loop) {
          println(s"${seq.name} - Looping")
          play(seq, offset)
        } else {
          println(s"${seq.name} - Finish")
        }
    }
  }
  
}
