package com.myfirstapp.sms

import android.content.Context

object SmsSessionStore {
  private const val PREFS_NAME = "sms_session"
  private const val KEY_START = "session_start"

  fun setStart(context: Context, startTime: Long) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putLong(KEY_START, startTime)
      .apply()
  }

  fun getStart(context: Context): Long? {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    return if (prefs.contains(KEY_START)) {
      prefs.getLong(KEY_START, 0L)
    } else {
      null
    }
  }

  fun clear(context: Context) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .remove(KEY_START)
      .apply()
  }
}
