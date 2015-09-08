package com.joshmonson.dmxserver.playback

/**
 * Created by josh on 9/7/15.
 */
trait TimeEvent {}

case class UpdateEvent(time: Double) extends TimeEvent

case class DoneEvent() extends TimeEvent
