package com.mimusic.pro.audio

import android.content.Context
import android.media.audiofx.Equalizer

class AudioEffectsManager private constructor(private val context: Context) {
    private var equalizer: Equalizer? = null
    private var spatialDSP: AndroidSpatialAudioDSP? = null

    fun attachAudioSession(audioSessionId: Int) {
        try {
            equalizer = Equalizer(0, audioSessionId).apply {
                enabled = true
            }
            spatialDSP = AndroidSpatialAudioDSP(audioSessionId)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun release() {
        equalizer?.release()
        spatialDSP?.release()
        equalizer = null
        spatialDSP = null
    }

    companion object {
        @Volatile
        private var instance: AudioEffectsManager? = null

        fun getInstance(context: Context): AudioEffectsManager {
            return instance ?: synchronized(this) {
                instance ?: AudioEffectsManager(context.applicationContext).also { instance = it }
            }
        }
    }
}
