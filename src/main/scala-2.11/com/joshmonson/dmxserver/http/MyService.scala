package com.joshmonson.dmxserver.http

import java.io.File

import akka.actor._
import com.joshmonson.dmxserver.playback.SequencePlayer
import com.joshmonson.dmxserver.sequence.DmxSequence
import com.joshmonson.dmxserver.audio.WaveformGenerator
import org.apache.commons.io.{IOUtils, FileUtils}
import spray.can.Http
import spray.can.Http.RegisterChunkHandler
import spray.http.HttpMethods._
import spray.http.HttpHeaders._
import spray.http.MediaTypes._
import spray.http._
import spray.json._
import com.joshmonson.dmxserver.sequence.DmxJsonProtocol._

import scala.concurrent.duration._

/**
 * Created by josh.monson on 9/12/15.
 */
class MyService extends Actor with ActorLogging {
  implicit val timeout = 1.second

  def jsonResponse(json: JsValue) =
    HttpResponse(entity = HttpEntity(`application/json`, json.compactPrint), headers = List(`Access-Control-Allow-Origin`(AllOrigins)))

  override def receive: Receive = {
    // when a new connection comes in we register ourselves as the connection handler
    case _: Http.Connected => sender ! Http.Register(self)

    case HttpRequest(OPTIONS, _, h, _, _) =>
      println(h)
      val headers = List(
        `Access-Control-Allow-Origin`(AllOrigins),
        `Access-Control-Allow-Methods`(GET, POST, PUT, DELETE),
        `Access-Control-Allow-Headers`("Content-Type"),
        `Access-Control-Max-Age`(600)
      )
      sender ! HttpResponse(StatusCodes.OK, headers = headers)

    case HttpRequest(GET, Uri.Path("/api/sequences"), _, _, _) =>
      val files = new File("./files/").listFiles().toVector.map(f => JsString(f.getName.replace(".dmx.json", "")))
      sender ! jsonResponse(JsArray(files))

    case HttpRequest(POST, Uri.Path("/api/sequences"), _, entity, _) =>
      val json = JsonParser(ParserInput(entity.asString))
      val dmxSequence = json.convertTo[DmxSequence]
      val file = new File("./files/" + dmxSequence.name + ".dmx.json")
      FileUtils.writeStringToFile(file, dmxSequence.toJson.prettyPrint)
      sender ! jsonResponse(JsObject("saved" -> JsBoolean(true), "path" -> JsString(file.getAbsolutePath)))

    case HttpRequest(GET, Uri.Path(path), _, _, _) if path startsWith "/api/sequences/" =>
      val name = path.replace("/api/sequences/", "")
      val file = new File("./files/" + name + ".dmx.json")
      val text = FileUtils.readFileToString(file)
      val json = JsonParser(ParserInput(text))
      sender ! jsonResponse(json)

    case HttpRequest(DELETE, Uri.Path(path), _, _, _) if path startsWith "/api/sequences/" =>
      val name = path.replace("/api/sequences/", "")
      val file = new File("./files/" + name + ".dmx.json")
      file.delete()
      sender ! jsonResponse(JsObject("deleted" -> JsBoolean(true)))

    case HttpRequest(GET, Uri.Path("/api/media"), _, _, _) =>
      val files = new File("./media").listFiles().toVector.map(f => JsString(f.getName))
      sender ! jsonResponse(JsArray(files))

    case HttpRequest(GET, Uri.Path(path), _, _, _) if path startsWith "/api/media/" =>
      val file = new File(path.replace("/api", "."))
      val bytes = FileUtils.readFileToByteArray(file)
      sender ! HttpResponse(entity = HttpEntity(`audio/mpeg`, bytes), headers = List(`Access-Control-Allow-Origin`(AllOrigins)))

    case HttpRequest(GET, Uri.Path(path), _, _, _) if path startsWith "/api/waveforms/" =>
      val file = new File(path.replace("/api", "."))
      if (!file.exists()) {
        println("Generating waveform...")
        WaveformGenerator.generate(new File(path.replace("/api", ".").replace("waveforms", "media").replace("png", "mp3")))
      }
      val bytes = FileUtils.readFileToByteArray(file)
      sender ! HttpResponse(entity = HttpEntity(`image/png`, bytes), headers = List(`Access-Control-Allow-Origin`(AllOrigins)))

    case HttpRequest(GET, Uri.Path(path), _, _, _) if path startsWith "/api/start/" =>
      val name = path.replace("/api/start/", "")
      val file = new File("./files/" + name + ".dmx.json")
      val text = FileUtils.readFileToString(file)
      val json = JsonParser(ParserInput(text))
      val sequence = json.convertTo[DmxSequence]
      SequencePlayer.play(sequence)
      sender ! HttpResponse(StatusCodes.OK)

    case _ => sender ! HttpResponse(StatusCodes.NotFound)

  }
}
