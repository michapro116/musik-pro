package com.mimusic.pro.audio

import android.media.audiofx.BassBoost
import android.media.audiofx.Virtualizer

enum class AndroidSpatialEnvironment {
    STUDIO, AUDITORIUM, CONCERT, CLUB
}

class AndroidSpatialAudioDSP(private val audioSessionId: Int) {
    private var bassBoost: BassBoost? = null
    private var virtualizer: Virtualizer? = null

    init {
        try {
            bassBoost = BassBoost(0, audioSessionId).apply {
                enabled = true
            }
            virtualizer = Virtualizer(0, audioSessionId).apply {
                enabled = true
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Ajusta el refuerzo dinámico de graves (0 a 1000 millibels)
     */
    fun setBassBoostStrength(strengthPercent: Int) {
        val millibels = (strengthPercent.coerceIn(0, 100) * 10).toShort()
        bassBoost?.let {
            if (it.strengthSupported) {
                it.setStrength(millibels)
            }
        }
    }

    /**
     * Configura la apertura estéreo 3D y entorno acústico
     */
    fun setSpatialVirtualizer(widthPercent: Int, environment: AndroidSpatialEnvironment = AndroidSpatialEnvironment.STUDIO) {
        val millibels = (widthPercent.coerceIn(0, 100) * 10).toShort()
        virtualizer?.let {
            if (it.strengthSupported) {
                it.setStrength(millibels)
            }
            // Activa modo binaural surround para auriculares
            try {
                it.forceVirtualizationMode(Virtualizer.VIRTUALIZATION_MODE_BINAURAL)
            } catch (_: Exception) {}
        }
    }

    fun release() {
        bassBoost?.release()
        virtualizer?.release()
        bassBoost = null
        virtualizer = null
    }
}
