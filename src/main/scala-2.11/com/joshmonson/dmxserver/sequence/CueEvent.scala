package com.joshmonson.dmxserver.sequence

case class CueValue(time: Double, value: Double)

case class CueEvent(channel: Int, start: CueValue, end: CueValue) {

  def getValue(time: Double, persist: Boolean) = {
    if (persist && time > end.time) {
      end.value
    } else if (time < start.time || time > end.time) {
      0.0
    } else {
      val percent = (time - start.time) / (end.time - start.time)
      ((1 - percent) * start.value) + (percent * end.value)
    }
  }

}