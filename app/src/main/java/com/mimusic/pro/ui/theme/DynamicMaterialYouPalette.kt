package com.mimusic.pro.ui.theme

import android.graphics.Bitmap
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.palette.graphics.Palette

data class AlbumCoverPalette(
    val primary: Color = Color(0xFF10B981),
    val secondary: Color = Color(0xFF06B6D4),
    val surface: Color = Color(0xFF121217),
    val backgroundGlow: Color = Color(0x3310B981)
)

@Composable
fun rememberAlbumDynamicPalette(bitmap: Bitmap?): AlbumCoverPalette {
    return remember(bitmap) {
        if (bitmap == null) {
            AlbumCoverPalette()
        } else {
            val palette = Palette.from(bitmap).generate()
            val vibrant = palette.getVibrantColor(0xFF10B981.toInt())
            val dominant = palette.getDominantColor(0xFF06B6D4.toInt())
            val darkMuted = palette.getDarkMutedColor(0xFF121217.toInt())

            AlbumCoverPalette(
                primary = Color(vibrant),
                secondary = Color(dominant),
                surface = Color(darkMuted),
                backgroundGlow = Color(vibrant).copy(alpha = 0.35f)
            )
        }
    }
}
