package com.powersaving

import android.content.Context
import android.os.Build
import android.os.PowerManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod


class PowerSavingModeModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "PowerSavingModeModule"
    }

    @ReactMethod
    fun isPowerSavingModeEnabled(promise: Promise) {
        try {
            val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            val isPowerSavingModeEnabled: Boolean = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                powerManager.isPowerSaveMode
            } else {
                false // For versions below Lollipop, assume power saving mode is disabled
            }
            promise.resolve(isPowerSavingModeEnabled)
        } catch (e: Exception) {
            promise.reject("ERROR_CHECKING_POWER_SAVING_MODE", e)
        }
    }
}
