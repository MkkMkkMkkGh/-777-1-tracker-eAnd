package com.myfirstapp.sms

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.content.ContextCompat
import androidx.core.app.NotificationManagerCompat

class SmsSessionService : Service() {
  private val handler = Handler(Looper.getMainLooper())
  private var ticker: Runnable? = null
  private var sessionStart: Long? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_START -> {
        val startTime = intent.getLongExtra(EXTRA_START, 0L)
        if (startTime > 0L) {
          SmsSessionStore.setStart(this, startTime)
          sessionStart = startTime
          startForeground(
            NotificationUtils.NOTIFICATION_ID,
            NotificationUtils.buildNotification(this, elapsedMs(startTime)),
          )
          startTicker()
          return START_STICKY
        }
      }
      ACTION_STOP -> {
        stopTicker()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        return START_NOT_STICKY
      }
    }

    val storedStart = SmsSessionStore.getStart(this)
    return if (storedStart != null) {
      sessionStart = storedStart
      startForeground(
        NotificationUtils.NOTIFICATION_ID,
        NotificationUtils.buildNotification(this, elapsedMs(storedStart)),
      )
      startTicker()
      START_STICKY
    } else {
      stopSelf()
      START_NOT_STICKY
    }
  }

  override fun onDestroy() {
    stopTicker()
    super.onDestroy()
  }

  private fun startTicker() {
    if (ticker != null) return
    val task = object : Runnable {
      override fun run() {
        val startTime = sessionStart ?: return
        val elapsed = elapsedMs(startTime)
        NotificationManagerCompat.from(this@SmsSessionService)
          .notify(
            NotificationUtils.NOTIFICATION_ID,
            NotificationUtils.buildNotification(this@SmsSessionService, elapsed),
          )
        handler.postDelayed(this, 1000)
      }
    }
    ticker = task
    handler.post(task)
  }

  private fun stopTicker() {
    ticker?.let { handler.removeCallbacks(it) }
    ticker = null
  }

  private fun elapsedMs(startTime: Long): Long {
    return (System.currentTimeMillis() - startTime).coerceAtLeast(0L)
  }

  companion object {
    private const val ACTION_START = "com.myfirstapp.sms.SESSION_START"
    private const val ACTION_STOP = "com.myfirstapp.sms.SESSION_STOP"
    private const val EXTRA_START = "session_start"

    fun start(context: Context, startTime: Long) {
      val intent = Intent(context, SmsSessionService::class.java)
        .setAction(ACTION_START)
        .putExtra(EXTRA_START, startTime)
      ContextCompat.startForegroundService(context, intent)
    }

    fun stop(context: Context) {
      val intent = Intent(context, SmsSessionService::class.java)
        .setAction(ACTION_STOP)
      context.startService(intent)
    }
  }
}
