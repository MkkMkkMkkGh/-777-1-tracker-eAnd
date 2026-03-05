package com.myfirstapp.sms

import android.content.Context
import android.provider.Telephony
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class SmsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    private const val PREFS_NAME = "sms_store"
    private const val KEY_SENDER = "last_sender"
    private const val KEY_BODY = "last_body"
    private const val KEY_TIMESTAMP = "last_timestamp"

    @Volatile
    private var currentContext: ReactApplicationContext? = null

    fun storeLastSms(context: Context, sender: String?, body: String?, timestamp: Long) {
      val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
      prefs.edit()
        .putString(KEY_SENDER, sender)
        .putString(KEY_BODY, body)
        .putLong(KEY_TIMESTAMP, timestamp)
        .apply()
    }

    fun emitSmsReceived(sender: String?, body: String?, timestamp: Long) {
      val ctx = currentContext ?: return
      val params = Arguments.createMap().apply {
        putString("sender", sender)
        putString("body", body)
        putDouble("timestamp", timestamp.toDouble())
      }
      ctx
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit("SmsReceived", params)
    }
  }

  override fun getName(): String = "SmsModule"

  override fun initialize() {
    super.initialize()
    currentContext = reactContext
  }

  override fun invalidate() {
    super.invalidate()
    if (currentContext === reactContext) {
      currentContext = null
    }
  }

  @ReactMethod
  fun getStoredLastSms(promise: Promise) {
    val prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    if (!prefs.contains(KEY_BODY)) {
      promise.resolve(null)
      return
    }
    val map = Arguments.createMap().apply {
      putString("sender", prefs.getString(KEY_SENDER, null))
      putString("body", prefs.getString(KEY_BODY, null))
      putDouble("timestamp", prefs.getLong(KEY_TIMESTAMP, 0L).toDouble())
    }
    promise.resolve(map)
  }

  @ReactMethod
  fun getLastSmsFromSender(sender: String, promise: Promise) {
    try {
      val cursor = reactContext.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        arrayOf(Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE),
        "${Telephony.Sms.ADDRESS} LIKE ?",
        arrayOf("%$sender%"),
        "${Telephony.Sms.DATE} DESC",
      )
      cursor?.use {
        if (it.moveToFirst()) {
          val address = it.getString(0)
          val body = it.getString(1)
          val date = it.getLong(2)
          val map = Arguments.createMap().apply {
            putString("sender", address)
            putString("body", body)
            putDouble("timestamp", date.toDouble())
          }
          promise.resolve(map)
          return
        }
      }
      promise.resolve(null)
    } catch (ex: Exception) {
      promise.reject("SMS_QUERY_FAILED", ex)
    }
  }
}
