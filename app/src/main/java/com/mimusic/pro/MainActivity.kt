package com.mimusic.pro

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mimusic.pro.playback.MusicService
import com.mimusic.pro.ui.car.CarModeActivity
import com.mimusic.pro.ui.components.ContinuousWaveformVisualizer
import com.mimusic.pro.ui.components.HiResAudioBadge

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            val serviceIntent = Intent(this, MusicService::class.java)
            startService(serviceIntent)
        } catch (_: Exception) {}

        setContent {
            MiMusicProApp(
                onOpenCarMode = {
                    startActivity(Intent(this, CarModeActivity::class.java))
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MiMusicProApp(onOpenCarMode: () -> Unit) {
    var isPlaying by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = Color(0xFF0A0A0D),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "MiMusic PRO",
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF0A0A0D)
                ),
                actions = {
                    IconButton(onClick = onOpenCarMode) {
                        Text("🚗", fontSize = 18.sp)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(220.dp)
                    .background(Color(0xFF14141A), RoundedCornerShape(24.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "🎵",
                    fontSize = 64.sp
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            HiResAudioBadge(isHiRes = true, bitrate = "96kHz / 24-bit")

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "MiMusic Pro Player",
                fontWeight = FontWeight.Bold,
                fontSize = 22.sp,
                color = Color.White
            )

            Text(
                text = "Reproductor Nativo Android & Google Drive",
                fontSize = 13.sp,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(24.dp))

            ContinuousWaveformVisualizer(isPlaying = isPlaying)

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = { isPlaying = !isPlaying },
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF10B981)
                ),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth(0.6f)
            ) {
                Text(
                    text = if (isPlaying) "Pausar" else "Reproducir",
                    color = Color.Black,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
