package com.mimusic.pro.service

import android.content.Context
import android.content.Intent
import android.view.KeyEvent
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService

class MediaSessionHelper(private val context: Context, private val mediaSession: MediaSession) {
    fun handleMediaKeyEvent(intent: Intent): Boolean {
        val event = intent.getParcelableExtra<KeyEvent>(Intent.EXTRA_KEY_EVENT) ?: return false
        if (event.action != KeyEvent.ACTION_DOWN) return false

        return when (event.keyCode) {
            KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE,
            KeyEvent.KEYCODE_HEADSETHOOK -> {
                val player = mediaSession.player
                if (player.isPlaying) player.pause() else player.play()
                true
            }
            KeyEvent.KEYCODE_MEDIA_NEXT -> {
                mediaSession.player.seekToNext()
                true
            }
            KeyEvent.KEYCODE_MEDIA_PREVIOUS -> {
                mediaSession.player.seekToPrevious()
                true
            }
            else -> false
        }
    }
}
