package com.joshmonson.dmxserver.http

import java.io.File

import org.apache.commons.io.FilenameUtils
import spray.http.MediaTypes._

object FileExtension {

  implicit class FileExtensionConverter(file: File) {
    def getExt: String = FilenameUtils.getExtension(file.getName)
    def getType = forExtension(getExt).getOrElse(`text/plain`)
  }

}
