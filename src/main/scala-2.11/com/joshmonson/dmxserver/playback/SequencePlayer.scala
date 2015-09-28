package com.joshmonson.dmxserver.playback

import java.io.File

import com.joshmonson.dmxserver.activation.AggregateActivator
import com.joshmonson.dmxserver.audio.{AudioPreloader, AudioDriver}
import com.joshmonson.dmxserver.sequence.{CueEvent, DmxSequence}

/**
 * Created by josh on 9/7/15.
 */
object SequencePlayer {

  def getTimeDriver(seq: DmxSequence): TimeDriver =
    seq.media
      .map(m => AudioPreloader.getAudioDriver(m, seq.duration))
      .getOrElse(new SimpleTimeDriver(seq.duration))

  def play(seq: DmxSequence, offset: Int = 0): Unit = {
    val timeDriver = getTimeDriver(seq)
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
        active.foreach(AggregateActivator(time, offset))

        // See if anything on the active stack needs to be removed.
        active = active.filter(_.end.time >= time)
      case DoneEvent() => println("Done!!!")
    }
  }
  
}
