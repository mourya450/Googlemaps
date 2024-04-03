/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
} from 'react-native';
import GoogleMaps from './src/components/maps';
import { NativeModules } from 'react-native';

function App(): React.JSX.Element {
  const [isEnabled,setIsEnabled] = useState<boolean>(false)
  const PowerSavingModeModule = NativeModules.PowerSavingModeModule;

  const checkPowerSavingMode = () => {
    PowerSavingModeModule.isPowerSavingModeEnabled()
      .then((isEnabled: any) => {
        if(isEnabled){
          Alert.alert("Your phone is in Power saving mode")
        }
        setIsEnabled(isEnabled)
      })
      .catch((error: any) => {
        console.error('Error checking power saving mode:', error);
      });
  };


  useEffect(() => {
    checkPowerSavingMode()
  }, [])

  return (
    <SafeAreaView style={{flex:1}}>
      <GoogleMaps isEnabled={isEnabled}/>
    </SafeAreaView>
  );
}


export default App;
