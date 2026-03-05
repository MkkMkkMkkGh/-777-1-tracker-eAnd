package com.myfirstapp.sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

class SmsReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
      return
    }
    val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
    if (messages.isNullOrEmpty()) {
      return
    }

    val sender = messages.first().originatingAddress
    val body = messages.joinToString(separator = "") { it.messageBody }
    val timestamp = messages.first().timestampMillis

    SmsModule.storeLastSms(context, sender, body, timestamp)
    SmsModule.emitSmsReceived(sender, body, timestamp)

    val normalized = body.trim().lowercase()
    if (normalized == "one") {
      SmsSessionStore.setStart(context, timestamp)
      SmsSessionService.start(context, timestamp)
    } else if (normalized == "two") {
      SmsSessionStore.clear(context)
      SmsSessionService.stop(context)
      NotificationUtils.cancelPersistent(context)
    }
  }
}
