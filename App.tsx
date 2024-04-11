/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
} from 'react-native';
import GoogleMaps from './src/components/maps';
import { NativeModules, AppState } from 'react-native';

function App(): React.JSX.Element {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
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
    console.log(appState)
    return()=>{console.log(appState)}
  }, [])

  return (
    <SafeAreaView style={{flex:1}}>
      <GoogleMaps isEnabled={isEnabled}/>
    </SafeAreaView>
  );
}


export default App;
