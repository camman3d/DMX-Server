package com.joshmonson.dmxserver.playback

import java.util.Date


class SimpleTimeDriver(duration: Double, interval: Double = 0.2) extends TimeDriver {

  var time = 0.0

  override def play(handler: (TimeEvent) => Unit): Unit = {
    val start = new Date().getTime.toDouble
    while (time < duration) {
      handler(UpdateEvent(time))

      Thread.sleep((interval * 1000).toInt)
      time = (new Date().getTime.toDouble - start) / 1000.0
    }
    handler(DoneEvent())
  }
}
