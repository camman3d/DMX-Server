package com.joshmonson.dmxserver.audio

import java.io.File

/**
 * Created by josh.monson on 9/28/15.
 */
object AudioPreloader {

  val audioDrivers = new File("./media/")
    .listFiles()
    .filter(_.getName.endsWith(".mp3"))
    .map(file => {
      println("Loading audio: " + file.getName)
      file.getName -> new AudioDriver(file)
    })
    .toMap

  def getAudioDriver(name: String, duration: Double) = {
    val driver = audioDrivers(name)
    driver.duration = duration
    driver
  }
}
