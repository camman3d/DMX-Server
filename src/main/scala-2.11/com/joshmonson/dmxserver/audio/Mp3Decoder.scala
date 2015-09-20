package com.joshmonson.dmxserver.audio

import java.io.{ByteArrayInputStream, File}
import javax.sound.sampled.{AudioFormat, AudioSystem}

import org.apache.commons.io.FileUtils

/**
 * Created by josh.monson on 9/20/15.
 */
object Mp3Decoder {

  def getInput(file: File) = {
    // read the  file
    val data = FileUtils.readFileToByteArray(file)
    val rawInput = AudioSystem.getAudioInputStream(new ByteArrayInputStream(data))

    // decode mp3
    val baseFormat = rawInput.getFormat
    val decodedFormat = new AudioFormat(
      AudioFormat.Encoding.PCM_SIGNED,  // Encoding to use
      baseFormat.getSampleRate,         // sample rate (same as base format)
      16,                               // sample size in bits (thx to Javazoom)
      baseFormat.getChannels,           // # of Channels
      baseFormat.getChannels * 2,       // Frame Size
      baseFormat.getSampleRate,         // Frame Rate
      false                             // Big Endian
    )
    val decodedInput = AudioSystem.getAudioInputStream(decodedFormat, rawInput)
    decodedInput
  }

}
