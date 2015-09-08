package com.joshmonson.dmxserver.sequence

import com.joshmonson.dmxserver.playback.TimeDriver

/**
 * Created by josh on 9/7/15.
 */
abstract class DmxMedia {

  def getTimeDriver: TimeDriver

}
