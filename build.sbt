name := "DMX Server"

version := "1.0"

scalaVersion := "2.11.7"

libraryDependencies ++= Seq(
  "io.spray" %% "spray-can" % "1.3.3",
  "io.spray" %% "spray-http" % "1.3.3",
  "io.spray" %% "spray-routing" % "1.3.3",
  "io.spray" %% "spray-json" % "1.3.2",
  "com.typesafe.akka" %% "akka-actor" % "2.3.13",
  "com.typesafe.akka" %% "akka-slf4j" % "2.3.13",
  "ch.qos.logback" % "logback-classic" % "1.1.3",
  "commons-io" % "commons-io" % "2.4",
  "com.googlecode.soundlibs" % "mp3spi" % "1.9.5-1"
)
