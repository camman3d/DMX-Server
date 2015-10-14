package com.joshmonson.dmxserver

import com.joshmonson.dmxserver.playback.SequencePlayer
import com.joshmonson.dmxserver.sequence.{CueValue, CueEvent, DmxSequence}


object Tester {

  def main(args: Array[String]) {

    val sequence = DmxSequence("123", 20, List(
      CueEvent(0, CueValue(0, 50), CueValue(5, 75)),
      CueEvent(1, CueValue(2, 50), CueValue(4, 75)),
      CueEvent(2, CueValue(3.5, 20), CueValue(6, 40)),
      CueEvent(3, CueValue(3.5, 20), CueValue(5, 40)),
      CueEvent(4, CueValue(7.5, 20), CueValue(15, 0))
    ), None, persist = false)




    SequencePlayer.play(sequence)


//    println("Testing out DMX")
//
//    if (!OpenDmx.connect(OpenDmx.OPENDMX_TX)) {
//      println("Open DMX Not connected!")
//    } else {
//      (0 until 4).foreach(i => OpenDmx.setValue(i, 100))
//      Thread.sleep(1000)
//      (0 until 4).foreach(i => OpenDmx.setValue(i, 200))
//      Thread.sleep(1000)
//      (0 until 4).foreach(i => OpenDmx.setValue(i, 100))
//      Thread.sleep(1000)
//      (0 until 4).foreach(i => OpenDmx.setValue(i, 200))
//      Thread.sleep(1000)
//
//      OpenDmx.disconnect()
//    }

  }

}
