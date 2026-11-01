package com.mimusic.pro.data

import android.content.ContentValues
import android.content.Context
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.provider.MediaStore
import java.io.File

data class EditableAudioTags(
    val title: String,
    val artist: String,
    val album: String,
    val year: String?,
    val genre: String?,
    val trackNumber: String?,
    val composer: String?,
    val artworkUri: Uri? = null
)

class ID3TagEditorHelper(private val context: Context) {
    /**
     * Lee metadatos enriquecidos de cualquier archivo de audio local
     */
    fun readTags(uri: Uri): EditableAudioTags {
        val retriever = MediaMetadataRetriever()
        return try {
            retriever.setDataSource(context, uri)
            EditableAudioTags(
                title = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE) ?: "Sin Título",
                artist = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST) ?: "Artista Desconocido",
                album = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM) ?: "Álbum Desconocido",
                year = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_YEAR),
                genre = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_GENRE),
                trackNumber = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_CD_TRACK_NUMBER),
                composer = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_COMPOSER)
            )
        } catch (e: Exception) {
            EditableAudioTags("Pista Local", "Artista Local", "Música", null, null, null, null)
        } finally {
            retriever.release()
        }
    }

    /**
     * Actualiza metadatos en la base de datos MediaStore de Android
     */
    fun updateMediaStoreTags(contentUri: Uri, tags: EditableAudioTags): Boolean {
        return try {
            val values = ContentValues().apply {
                put(MediaStore.Audio.Media.TITLE, tags.title)
                put(MediaStore.Audio.Media.ARTIST, tags.artist)
                put(MediaStore.Audio.Media.ALBUM, tags.album)
                tags.year?.toIntOrNull()?.let { put(MediaStore.Audio.Media.YEAR, it) }
            }
            context.contentResolver.update(contentUri, values, null, null) > 0
        } catch (e: Exception) {
            false
        }
    }
}
