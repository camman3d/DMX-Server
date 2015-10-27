package com.joshmonson.dmxserver.playback

class PlayRecord {

  val recordMap = collection.mutable.Map[String, Int]()

  def set(id: String) = {
    val current = recordMap.get(id)
    if (current.isEmpty) {
      recordMap.put(id, 0)
      0
    } else {
      recordMap.put(id, current.get + 1)
      current.get + 1
    }
  }
  
  def get(id: String) = recordMap(id)
  
}
