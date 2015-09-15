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

      def getObj(key: String) = json.fields(key).asJsObject
      def getArr(key: String): Vector[JsValue] = json.fields(key)
    }

    private def cueFromJson(channel: Int, json: JsValue) = {
      val start = json.asJsObject.getObj("start")
      val end = json.asJsObject.getObj("end")
      CueEvent(channel, CueValue(start.getDouble("time"), start.getDouble("value")), CueValue(end.getDouble("time"), end.getDouble("value")))
    }

    override def read(json: JsValue): DmxSequence = {
      val sequence = json.asJsObject.getObj("sequence")
      val name = sequence.getString("name")
      val duration = sequence.getDouble("duration")

      val events = json.asJsObject.getArr("tracks")
        .zipWithIndex
        .flatMap(data => toJsonArray(data._1).map(j => (j, data._2)))
        .map(j => cueFromJson(j._2, j._1))
        .sortBy(_.start.time)
        .toList

      DmxSequence(name, duration, events, None)
    }

    private def cueToJson(obj: CueEvent) =
      JsObject(
        "start" -> JsObject("time" -> JsNumber(obj.start.time), "value" -> JsNumber(obj.start.value)),
        "end" -> JsObject("time" -> JsNumber(obj.end.time), "value" -> JsNumber(obj.end.value))
      )

    override def write(obj: DmxSequence): JsValue = {
      val sequence = JsObject("name" -> JsString(obj.name), "duration" -> JsNumber(obj.duration))
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