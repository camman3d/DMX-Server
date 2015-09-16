package com.joshmonson.dmxserver.http

import java.io.File

import akka.actor._
import com.joshmonson.dmxserver.sequence.DmxSequence
import org.apache.commons.io.FileUtils
import spray.can.Http
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

    //    case HttpRequest(GET, Uri.Path(path), _, _, _) =>
    //      val file = new File("./client" + (if (path.startsWith("/bower_components")) path else "/app" + path))
    //      if (file.exists() && !file.isDirectory) {
    //        sender ! HttpResponse(entity = HttpEntity(file.getType, FileUtils.readFileToByteArray(file)))
    //      } else {
    //        sender ! HttpResponse(StatusCode.int2StatusCode(404))
    //      }

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

    case _ => sender ! HttpResponse(StatusCodes.NotFound)

  }
}
