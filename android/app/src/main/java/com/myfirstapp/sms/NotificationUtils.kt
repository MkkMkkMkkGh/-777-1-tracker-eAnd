package com.myfirstapp.sms

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.app.PendingIntent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.myfirstapp.R

object NotificationUtils {
  private const val CHANNEL_ID = "etisalat_sms"
  private const val CHANNEL_NAME = "Etisalat alerts"
  const val NOTIFICATION_ID = 1001
  private const val MINIMUM_CHARGE = 0.225
  private const val PER_MINUTE_CHARGE = 0.0075

  fun showPersistent(context: Context, elapsedMs: Long) {
    ensureChannel(context)
    val notification = buildNotification(context, elapsedMs)
    NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)
  }

  fun cancelPersistent(context: Context) {
    NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID)
  }

  fun buildNotification(context: Context, elapsedMs: Long): android.app.Notification {
    ensureChannel(context)
    val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
    val flags =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      } else {
        PendingIntent.FLAG_UPDATE_CURRENT
      }
    val pendingIntent = launchIntent?.let {
      PendingIntent.getActivity(context, 0, it, flags)
    }

    val totalSeconds = (elapsedMs.coerceAtLeast(0L) / 1000).toInt()
    val hours = totalSeconds / 3600
    val minutes = (totalSeconds % 3600) / 60
    val seconds = totalSeconds % 60
    val elapsed = String.format("%02d:%02d:%02d", hours, minutes, seconds)
    val minutesElapsed = totalSeconds / 60
    val spend = MINIMUM_CHARGE + (minutesElapsed * PER_MINUTE_CHARGE)
    val message = "Elapsed $elapsed • Spend AED ${String.format("%.3f", spend)}"

    return NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(R.mipmap.ic_launcher)
      .setContentTitle("Etisalat session active")
      .setContentText(message)
      .setStyle(NotificationCompat.BigTextStyle().bigText(message))
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setContentIntent(pendingIntent)
      .setAutoCancel(false)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .build()
  }

  private fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      val existing = manager.getNotificationChannel(CHANNEL_ID)
      if (existing == null) {
        val channel = NotificationChannel(
          CHANNEL_ID,
          CHANNEL_NAME,
          NotificationManager.IMPORTANCE_HIGH,
        )
        manager.createNotificationChannel(channel)
      }
    }
  }
}
