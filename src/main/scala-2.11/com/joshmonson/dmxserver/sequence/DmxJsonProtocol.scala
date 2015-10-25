package com.joshmonson.dmxserver.sequence

import spray.json._


object DmxJsonProtocol extends DefaultJsonProtocol {

  implicit object DmxSequenceFormat extends RootJsonFormat[DmxSequence] {

    implicit def toJsonArray(json: JsValue): Vector[JsValue] = json.asInstanceOf[JsArray].elements

    implicit class JsonObjHelper(json: JsObject) {
      def get[T](key: String): T = json.fields(key).asInstanceOf[T]
      def getString(key: String) = get[JsString](key).value
      def getNumber(key: String) = get[JsNumber](key).value
      def getDouble(key: String) = getNumber(key).toDouble
      def getInt(key: String) = getNumber(key).toInt

      def getOpt[T](key: String): Option[T] = json.fields.get(key).map(_.asInstanceOf[T])
      def getOptString(key: String) = getOpt[JsString](key).map(_.value)
      def getOptBoolean(key: String) = getOpt[JsBoolean](key).map(_.value)
      def getOptObj(key: String) = getOpt[JsObject](key)

      def getObj(key: String) = json.fields(key).asJsObject
      def getArr(key: String): Vector[JsValue] = json.fields(key)
    }

    private def cueFromJson(channel: Int, json: JsValue) = {
      val start = json.asJsObject.getObj("start")
      val end = json.asJsObject.getObj("end")
      try {
        Some(CueEvent(channel, CueValue(start.getDouble("time"), start.getDouble("value")), CueValue(end.getDouble("time"), end.getDouble("value"))))
      } catch {
        case e: NoSuchElementException => None
      }
    }

    override def read(json: JsValue): DmxSequence = {
      val sequence = json.asJsObject.getObj("sequence")
      val name = sequence.getString("name")
      val duration = sequence.getDouble("duration")
      val media = sequence.getOptString("media")
      val persist = sequence.getOptBoolean("persist").getOrElse(false)
      val loop = sequence.getOptBoolean("loop").getOrElse(false)

      val events = json.asJsObject.getArr("tracks")
        .zipWithIndex
        .flatMap(data => toJsonArray(data._1).map(j => (j, data._2)))
        .map(j => cueFromJson(j._2, j._1))
        .filter(_.isDefined)
        .map(_.get)
        .sortBy(_.start.time)
        .toList

      DmxSequence(name, duration, events, media, persist, loop)
    }

    private def cueToJson(obj: CueEvent) =
      JsObject(
        "start" -> JsObject("time" -> JsNumber(obj.start.time), "value" -> JsNumber(obj.start.value)),
        "end" -> JsObject("time" -> JsNumber(obj.end.time), "value" -> JsNumber(obj.end.value))
      )

    override def write(obj: DmxSequence): JsValue = {
      val sequence = JsObject(
        "name" -> JsString(obj.name),
        "duration" -> JsNumber(obj.duration),
        "media" -> obj.media.map(JsString.apply).getOrElse(JsNull),
        "persist" -> JsBoolean(obj.persist),
        "loop" -> JsBoolean(obj.loop)
      )
      val tracks = obj.events
        .groupBy(_.channel).toVector
        .sortBy(_._1).map(cues => JsArray(cues._2.map(cueToJson).toVector))
      JsObject(
        "sequence" -> sequence,
        "tracks" -> JsArray(tracks)
      )
    }
  }

}
