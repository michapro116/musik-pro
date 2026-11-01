package com.mimusic.pro.audio

import androidx.media3.common.audio.AudioProcessor
import androidx.media3.exoplayer.ExoPlayer
import kotlin.math.pow

class ReplayGainNormalizer(private val player: ExoPlayer) {
    private var isEnabled: Boolean = true
    private var baseVolume: Float = 1.0f

    fun setEnabled(enabled: Boolean) {
        this.isEnabled = enabled
    }

    fun applyGainForTrack(replayGainDb: Float?) {
        if (!isEnabled || replayGainDb == null) {
            player.volume = baseVolume
            return
        }

        // Conversión de decibelios a ganancia lineal (P = 10^(dB/20))
        val linearFactor = 10.0.pow(replayGainDb.toDouble() / 20.0).toFloat()
        val normalizedVolume = (baseVolume * linearFactor).coerceIn(0.1f, 1.25f)
        
        player.volume = normalizedVolume
    }
}
