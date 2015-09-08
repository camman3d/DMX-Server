package com.joshmonson.dmxserver.sequence

case class CueValue(time: Double, value: Double)

case class CueEvent(channel: Int, start: CueValue, end: CueValue) {

  def getValue(time: Double) = {
    val percent = (time - start.time) / (end.time - start.time)
    ((1 - percent) * start.value) + (percent * end.value)
  }

}