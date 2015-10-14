package com.joshmonson.dmxserver.sequence

import spray.json.JsValue

/**
 * Created by josh on 9/7/15.
 */
case class DmxSequence(name: String, duration: Double, events: List[CueEvent], media: Option[String], persist: Boolean) {

  def toDeltaClock = new DeltaClock(events.map(e => (e, e.start.time)))

}