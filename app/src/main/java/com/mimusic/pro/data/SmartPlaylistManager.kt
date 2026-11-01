package com.mimusic.pro.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

data class SmartMix(
    val id: String,
    val title: String,
    val description: String,
    val queryType: String
)

class SmartPlaylistManager(private val songDao: SongDao) {
    fun getHiResCollection(): Flow<List<SongEntity>> {
        return songDao.getAllSongs().map { list ->
            list.filter { it.isHiRes || it.mimeType.contains("flac") }
        }
    }

    fun getMostPlayed(limit: Int = 25): Flow<List<SongEntity>> {
        return songDao.getSongsOrderByPlayCount(limit)
    }

    fun getHighEnergyMix(): Flow<List<SongEntity>> {
        return songDao.getAllSongs().map { list ->
            list.filter { 
                it.genre.contains("Urbano", ignoreCase = true) || 
                it.genre.contains("Rock", ignoreCase = true) ||
                it.genre.contains("Reggaetón", ignoreCase = true)
            }
        }
    }
}
