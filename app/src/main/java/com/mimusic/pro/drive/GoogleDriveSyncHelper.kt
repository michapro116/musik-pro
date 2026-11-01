package com.mimusic.pro.drive

import android.content.Context
import android.os.Environment
import androidx.media3.common.MediaItem
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.source.ProgressiveMediaSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL

data class DriveAudioFile(
    val id: String,
    val name: String,
    val mimeType: String,
    val sizeBytes: Long
)

/**
 * Gestor de sincronización de Google Drive en Android.
 * Utiliza scope: https://www.googleapis.com/auth/drive.readonly
 */
class GoogleDriveSyncHelper(private val context: Context) {

    /**
     * Consulta archivos de audio en la unidad de Google Drive
     */
    suspend fun queryDriveAudioFiles(accessToken: String): List<DriveAudioFile> = withContext(Dispatchers.IO) {
        val query = "trashed = false and (mimeType contains 'audio/' or name contains '.mp3' or name contains '.flac' or name contains '.wav')"
        val encodedQuery = java.net.URLEncoder.encode(query, "UTF-8")
        val endpoint = "https://www.googleapis.com/drive/v3/files?q=$encodedQuery&fields=files(id,name,mimeType,size)&pageSize=100"

        val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            setRequestProperty("Authorization", "Bearer $accessToken")
        }

        if (connection.responseCode == 200) {
            val responseText = connection.inputStream.bufferedReader().use { it.readText() }
            val json = JSONObject(responseText)
            val filesArray = json.optJSONArray("files") ?: return@withContext emptyList()
            val list = mutableListOf<DriveAudioFile>()

            for (i in 0 until filesArray.length()) {
                val item = filesArray.getJSONObject(i)
                list.add(
                    DriveAudioFile(
                        id = item.getString("id"),
                        name = item.getString("name"),
                        mimeType = item.optString("mimeType", "audio/mpeg"),
                        sizeBytes = item.optLong("size", 0L)
                    )
                )
            }
            list
        } else {
            emptyList()
        }
    }

    /**
     * Descarga la pista a almacenamiento local privado o compartido para reproducción offline
     */
    suspend fun downloadDriveTrack(fileId: String, fileName: String, accessToken: String): File = withContext(Dispatchers.IO) {
        val downloadUrl = "https://www.googleapis.com/drive/v3/files/$fileId?alt=media"
        val connection = (URL(downloadUrl).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            setRequestProperty("Authorization", "Bearer $accessToken")
        }

        val musicDir = context.getExternalFilesDir(Environment.DIRECTORY_MUSIC) ?: context.filesDir
        val destinationFile = File(musicDir, fileName)

        connection.inputStream.use { input ->
            FileOutputStream(destinationFile).use { output ->
                input.copyTo(output)
            }
        }

        destinationFile
    }

    /**
     * Genera una fuente de medios autenticada para streaming directo en ExoPlayer
     */
    fun createAuthenticatedMediaSource(fileId: String, accessToken: String): ProgressiveMediaSource {
        val dataSourceFactory = DefaultHttpDataSource.Factory()
            .setDefaultRequestProperties(mapOf("Authorization" to "Bearer $accessToken"))
        
        val mediaUri = android.net.Uri.parse("https://www.googleapis.com/drive/v3/files/$fileId?alt=media")
        val mediaItem = MediaItem.fromUri(mediaUri)

        return ProgressiveMediaSource.Factory(dataSourceFactory).createMediaSource(mediaItem)
    }
}
