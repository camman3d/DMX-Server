package com.joshmonson.dmxserver.playback

/**
 * Created by josh on 9/7/15.
 */
trait TimeDriver {

  def play(handler: TimeEvent => Unit)

}
