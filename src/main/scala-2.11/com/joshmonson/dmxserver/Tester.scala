package com.joshmonson.dmxserver

import com.juanjo.openDmx.OpenDmx


object Tester {

  def main(args: Array[String]) {

    println("Testing out DMX")

    if (!OpenDmx.connect(OpenDmx.OPENDMX_TX)) {
      println("Open DMX Not connected!")
    } else {
      (0 until 4).foreach(i => OpenDmx.setValue(i, 100))
      Thread.sleep(1000)
      (0 until 4).foreach(i => OpenDmx.setValue(i, 200))
      Thread.sleep(1000)
      (0 until 4).foreach(i => OpenDmx.setValue(i, 100))
      Thread.sleep(1000)
      (0 until 4).foreach(i => OpenDmx.setValue(i, 200))
      Thread.sleep(1000)

      OpenDmx.disconnect()
    }

  }

}
