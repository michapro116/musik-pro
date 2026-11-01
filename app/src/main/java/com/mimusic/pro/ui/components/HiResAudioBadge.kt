package com.mimusic.pro.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun HiResAudioBadge(
    isHiRes: Boolean,
    bitrate: String? = null,
    modifier: Modifier = Modifier
) {
    if (isHiRes) {
        Box(
            modifier = modifier
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(Color(0xFF332005), Color(0xFF452B05))
                    ),
                    shape = RoundedCornerShape(4.dp)
                )
                .border(
                    width = 0.8.dp,
                    color = Color(0xFFF59E0B),
                    shape = RoundedCornerShape(4.dp)
                )
                .padding(horizontal = 6.dp, vertical = 2.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "HI-RES LOSSLESS",
                color = Color(0xFFFCD34D),
                fontSize = 9.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 0.5.sp
            )
        }
    } else if (bitrate?.contains("320") == true) {
        Box(
            modifier = modifier
                .background(Color(0xFF27272A), RoundedCornerShape(4.dp))
                .border(0.8.dp, Color(0xFF3F3F46), RoundedCornerShape(4.dp))
                .padding(horizontal = 5.dp, vertical = 2.dp)
        ) {
            Text(
                text = "320K HQ",
                color = Color(0xFF34D399),
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
