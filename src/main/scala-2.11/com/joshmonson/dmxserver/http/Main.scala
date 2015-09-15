package com.joshmonson.dmxserver.http

import akka.actor.{Props, ActorSystem}
import akka.io.IO
import com.typesafe.config.ConfigFactory
import spray.can.Http

import scala.util.Try

/**
 * Created by josh.monson on 9/12/15.
 */
object Main extends App {

  implicit val system = ActorSystem()

  val config = ConfigFactory.load()
  val host = Try(config.getString("service.host")).getOrElse("localhost")
  val port = Try(config.getInt("service.port")).getOrElse(8080)

  val handler = system.actorOf(Props[MyService], name = "handler")

  IO(Http) ! Http.Bind(handler, interface = host, port = port)

}
