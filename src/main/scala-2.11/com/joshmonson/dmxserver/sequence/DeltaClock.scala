package com.joshmonson.dmxserver.sequence


class DeltaClock[T](items: List[(T, Double)]) {

  class DeltaClockEntry(var time: Double, val value: T)

  var entries: List[DeltaClockEntry] =
    items.zip(0.0 :: items.map(_._2).dropRight(1)).map(item => new DeltaClockEntry(item._1._2 - item._2, item._1._1))

  def update(deltaTime: Double): List[T] = {

    def updateEntries(entries: List[DeltaClockEntry], deltaTime: Double): Unit = {
      if (entries.nonEmpty) {
        entries.head.time -= deltaTime
        if (entries.head.time < 0) { // Rollover
          updateEntries(entries.tail, -entries.head.time)
        }
      }
    }
    updateEntries(entries, deltaTime)

    val active = entries.takeWhile(_.time <= 0)
    entries = entries.drop(active.size)
    active.map(_.value)
  }

  override def toString: String =
    "----------------------------------------" +
    entries.map(e => s"| ${e.time} | ${e.value} |").mkString("\n", "\n", "\n") +
    "----------------------------------------"
}
