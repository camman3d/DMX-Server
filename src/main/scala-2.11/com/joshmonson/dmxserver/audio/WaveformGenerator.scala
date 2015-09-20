package com.joshmonson.dmxserver.audio

import java.awt.Color
import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO
import javax.sound.sampled.{AudioSystem, AudioFormat, AudioInputStream}

/**
 * Created by josh.monson on 9/18/15.
 */
object WaveformGenerator {

  def average(bytes: Vector[Byte]) =
//    bytes.map(b => Math.abs(b.toLong)).sum.toDouble / bytes.size
    bytes.map(_.toLong).sum.toDouble / bytes.size

  def generate(file: File): Unit = {

    // Load the audio file
    val audioFile = AudioSystem.getAudioFileFormat(file)
    val audio = Mp3Decoder.getInput(file)
//    val audio = AudioSystem.getAudioInputStream(file)
    val format = audio.getFormat

    // Get the bytes
    val duration = audioFile.getFrameLength / format.getFrameRate
    val byteArr = new Array[Byte](audioFile.getByteLength)
    audio.read(byteArr)
    val bytes = byteArr.toVector

    // Generate the samples
    val resolution = 15 // 15 px per sec. 2:30 song is 2250px wide
    val sampleRate = audioFile.getByteLength / (duration * resolution).toInt
    val samples = bytes
      .grouped(sampleRate) // Take each sample
      .map(average) // and average it
      .toVector
    val sampleMax = samples.max

    // Image creation setup
    val width = samples.size
    val height = 250
    val image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB)
    val g2 = image.createGraphics()

    // Create the image
    g2.setBackground(Color.black)
    g2.clearRect(0, 0, width, height)
    g2.setColor(Color.white)
    val mid = height / 2
    samples.zipWithIndex.foreach(sample => {
      val sampleHeight = (sample._1 / sampleMax) * height
      val y = (sampleHeight / 2).toInt
      g2.drawLine(sample._2, mid - y, sample._2, mid + y)
    })


    // Wrap up
    g2.dispose()
    val name = file.getName.replace(".mp3", ".png")
    val imgFile = new File(s"./waveforms/$name")
    if (imgFile.exists())
      imgFile.delete()
    ImageIO.write(image, "png", imgFile)
//    val a = new AudioInputStream(input, format, length)

  }

}
