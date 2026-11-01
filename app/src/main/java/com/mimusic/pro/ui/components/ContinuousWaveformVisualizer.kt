package com.mimusic.pro.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import kotlin.math.sin

@Composable
fun ContinuousWaveformVisualizer(
    isPlaying: Boolean,
    modifier: Modifier = Modifier,
    primaryColor: Color = Color(0xFF10B981),
    secondaryColor: Color = Color(0xFF06B6D4)
) {
    // Animación infinita suave para mantener la onda en fase continua sin saltos
    val infiniteTransition = rememberInfiniteTransition(label = "waveform_phase")
    val phase by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 2f * Math.PI.toFloat(),
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2400, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "phase_angle"
    )

    // Amplitud suavizada con interpolación para transiciones Gapless sin parpadeos
    val amplitudeTarget = if (isPlaying) 1f else 0.15f
    val animatedAmplitude by animateFloatAsState(
        targetValue = amplitudeTarget,
        animationSpec = tween(durationMillis = 400, easing = FastOutSlowInEasing),
        label = "amplitude_lerp"
    )

    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .height(52.dp)
    ) {
        val width = size.width
        val height = size.height
        val centerY = height / 2f
        val pointsCount = 48
        val step = width / (pointsCount - 1)

        val wavePath = Path().apply {
            moveTo(0f, centerY)
            for (i in 0 until pointsCount) {
                val x = i * step
                val normalizedX = (i.toFloat() / pointsCount) * 4f * Math.PI.toFloat()
                val waveOffset = sin(normalizedX + phase) * (height * 0.38f * animatedAmplitude)
                val y = centerY + waveOffset

                if (i == 0) {
                    moveTo(x, y)
                } else {
                    val prevX = (i - 1) * step
                    val prevNormX = ((i - 1).toFloat() / pointsCount) * 4f * Math.PI.toFloat()
                    val prevY = centerY + sin(prevNormX + phase) * (height * 0.38f * animatedAmplitude)
                    quadraticBezierTo(prevX, prevY, (prevX + x) / 2f, (prevY + y) / 2f)
                }
            }
        }

        // Trazado con gradiente esmeralda a cian
        drawPath(
            path = wavePath,
            brush = Brush.horizontalGradient(
                colors = listOf(primaryColor, secondaryColor, primaryColor)
            ),
            style = Stroke(width = 4f)
        )
    }
}
