package com.joshmonson.dmxserver.audio

import java.io.File
import javax.sound.sampled.DataLine.Info
import javax.sound.sampled._

import com.joshmonson.dmxserver.playback.{DoneEvent, UpdateEvent, TimeDriver, TimeEvent}


class AudioDriver(file: File, duration: Double) extends TimeDriver {

  val sleepTime = 25

  val audio = Mp3Decoder.getInput(file)
  val format = audio.getFormat
  val info = new Info(classOf[Clip], format)
  val clip = AudioSystem.getLine(info).asInstanceOf[Clip]
  clip.open(audio)

  override def play(handler: (TimeEvent) => Unit): Unit = {
    clip.start()

    new Thread(new Runnable {
      override def run(): Unit = {
        var position = 0.0
        while (position < duration) {
          position = clip.getMicrosecondPosition.toDouble / 1000000.0 // Convert microseconds to seconds
          handler(UpdateEvent(position))
          Thread.sleep(sleepTime)
        }
        handler(DoneEvent())
        clip.stop()
      }
    }).start()

  }

}