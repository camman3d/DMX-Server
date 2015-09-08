package com.joshmonson.dmxserver.sequence

/**
 * Created by josh on 9/7/15.
 */
case class DmxSequence(id: String, events: List[CueEvent], media: Option[DmxMedia]) {
  def getDuration = events.map(_.end.time).max

  def toDeltaClock = new DeltaClock(events.map(e => (e, e.start.time)))

}
