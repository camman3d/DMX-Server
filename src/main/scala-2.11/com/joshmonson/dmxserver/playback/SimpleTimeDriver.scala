package com.joshmonson.dmxserver.playback

import java.util.Date

class SimpleTimeDriver(duration: Double, interval: Double = 0.1, id: String) extends TimeDriver {

  var time = 0.0

  override def play(handler: (TimeEvent) => Unit): Unit = {
    val runId = SimpleTimeDriver.playRecord.set(id)
    val start = new Date().getTime.toDouble

    new Thread(new Runnable {
      override def run(): Unit = {
        while (time < duration) {
          if (runId == SimpleTimeDriver.playRecord.get(id)) {
            handler(UpdateEvent(time))

            Thread.sleep((interval * 1000).toInt)
            time = (new Date().getTime.toDouble - start) / 1000.0
          } else {
            println(s"Show $id restarted")
            time = duration
          }
        }
        handler(DoneEvent())
      }
    }).start()
  }
}

object SimpleTimeDriver {
  val playRecord = new PlayRecord
}