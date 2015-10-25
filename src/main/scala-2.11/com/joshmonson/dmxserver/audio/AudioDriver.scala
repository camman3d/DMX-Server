package com.joshmonson.dmxserver.audio

import java.io.File
import javax.sound.sampled.DataLine.Info
import javax.sound.sampled._

import com.joshmonson.dmxserver.playback._


class AudioDriver(file: File) extends TimeDriver {
  val sleepTime = 25

  val audio = Mp3Decoder.getInput(file)
  val format = audio.getFormat
  val info = new Info(classOf[Clip], format)
  val clip = AudioSystem.getLine(info).asInstanceOf[Clip]
  clip.open(audio)

  var duration = 0.0
  var id = ""
//  var activeThread = 0

  override def play(handler: (TimeEvent) => Unit): Unit = {
    clip.stop()
    clip.setMicrosecondPosition(0)
    clip.start()
    val runId = AudioDriver.playRecord.set(id)

    new Thread(new Runnable {
      override def run(): Unit = {
        var position = 0.0
        while (runId == AudioDriver.playRecord.get(id) && position < duration) {
          position = clip.getMicrosecondPosition.toDouble / 1000000.0 // Convert microseconds to seconds
          handler(UpdateEvent(position))
          Thread.sleep(sleepTime)
        }
        if (runId == AudioDriver.playRecord.get(id)) {
          handler(DoneEvent())
          clip.stop()
        } else {
          println(s"Show restarted. Aborting thread #$id")
        }
      }
    }).start()

  }

}

object AudioDriver {
  val playRecord = new PlayRecord
}
