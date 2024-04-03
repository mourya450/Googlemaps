import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { Alert, Dimensions, Image, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import { useEffect, useRef, useState } from 'react';
import { position } from './types';
import MapViewDirections from 'react-native-maps-directions';
import { currloc } from '../../assets';
import { apiKey } from '../../apiKey';

type props ={
    isEnabled:boolean
}
export default function GoogleMaps(props:props) {
    const mapRef = useRef<MapView>(null);
    const userRef = useRef<any>(null)
    const [positions, setPosition] = useState<position>({
        latitude: 30.92609815689669,
        longitude: 75.88825445502076,
    });
    const [in_address, setInAddress] = useState<position>()
    const [dest, setDest] = useState<position>()
    const [direction, setDirection] = useState<boolean>(false)
    const [coordinate, setCoordinates] = useState([])

    const moveto = async (positions: position) => {
        const camera = await mapRef.current?.getCamera()
        if (camera) {
            camera.center = positions
            mapRef.current?.animateCamera(camera, { duration: 1000 })
        }
    }

    const requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message:
                        'Need to access your location ',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('You can use the location');
                getCurrentPosition()
            } else {
                console.log('Location permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const getCurrentPosition = () => {
        Geolocation.getCurrentPosition(
            (pos: any) => {
                let currPos = { latitude: pos.coords.latitude, longitude: pos.coords.latitude }
                setPosition(currPos);
                setInAddress(currPos);
            },
            (error: any) => Alert.alert('GetCurrentPosition Error', JSON.stringify(error)),
            { enableHighAccuracy: true }
        );
    };

    useEffect(() => {
        if(direction){
            const intervalId = setInterval(requestLocationPermission, 10 * 60 * 1000);
            return () => clearInterval(intervalId);
        }
    }, [direction])

    useEffect(() => {
        requestLocationPermission()
    }, [])

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                style={styles.map}
                initialRegion={{
                    latitude: positions.latitude,
                    longitude: positions.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                }}
            >
                {direction && dest && in_address &&
                    <MapViewDirections
                        origin={in_address}
                        destination={dest}
                        apikey={apiKey}
                        strokeWidth={6}
                        strokeColor="hotpink"
                    />}
                {in_address && <Marker coordinate={in_address} pinColor={"blue"} title={"source"} />}
                {dest && <Marker coordinate={dest} pinColor={"red"} title={"destnition"} />}
                {coordinate.length > 2 && coordinate.map(data => {
                    return (
                        <Marker coordinate={data} pinColor={"red"} title={"destnition"} />)
                }
                )}
            </MapView>

            <View style={styles.inputContainer}>
                <GooglePlacesAutocomplete
                    ref={userRef}
                    placeholder={'Source Address'}
                    fetchDetails={true}
                    textInputProps={{
                        placeholderTextColor: 'gray',
                        style: {
                            backgroundColor: '#ffffff', 
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 8, 
                            paddingHorizontal: 10, 
                            paddingVertical: 8, 
                            color: props.isEnabled ? '#000' : '#fff', 
                            fontSize: 16,
                            fontWeight: '400',
                            width:"100%"
                        },
                    }}
                    styles={{
                        textInputContainer: {
                            backgroundColor: 'transparent',
                            zIndex:1,
                        },
                        listView: {
                            color: '#000',
                        },
                        row: {
                            backgroundColor: '#ffffff', 
                            padding: 10,
                        },
                        description: {
                            color: '#000',
                        },
                    }}
                    onPress={(data, details = null) => {
                        let positions = {
                            latitude: details?.geometry?.location.lat || 0,
                            longitude: details?.geometry?.location.lng || 0
                        }
                        setInAddress(positions)
                        moveto(positions)
                    }}
                    query={{
                        key: apiKey,
                        language: 'en',
                    }}
                />
                <TouchableOpacity style={styles.imgCon} 
                    onPress={() => {
                        userRef.current?.setAddressText('Your Location');
                        moveto(positions)
                }}>
                    <Image source={currloc} style={styles.imgStyle} />
                </TouchableOpacity>
                <GooglePlacesAutocomplete
                    placeholder='Destinition addresss'
                    fetchDetails={true}
                    textInputProps={{
                        placeholderTextColor: 'gray',
                        style: {
                            backgroundColor: '#ffffff', 
                            borderWidth: 1,
                            borderColor: '#ccc',
                            borderRadius: 8,
                            paddingHorizontal: 10, 
                            paddingVertical: 8, 
                            color: props.isEnabled ? '#000' : '#aaa',
                            fontSize: 16,
                            fontWeight: '400',
                            width:"100%"
                        },
                    }}
                    styles={{
                        textInputContainer: {
                            backgroundColor: 'transparent',
                            zIndex: 9999,
                        },
                        listView: {
                            color: '#000',
                        },
                        row: {
                            backgroundColor: '#ffffff',
                            padding: 10,
                        },
                        description: {
                            color: '#000',
                        },
                    }}
                    onPress={(data, details = null) => {
                        let positions = {
                            latitude: details?.geometry?.location.lat || 0,
                            longitude: details?.geometry?.location.lng || 0
                        }
                        setDest(positions)
                        moveto(positions)
                    }}
                    query={{
                        key: apiKey,
                        language: 'en',
                    }}
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={() => { setDirection(true); }}>
                <Text style={styles.textInput}>
                    Get Direction
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "flex-start"
    },
    map: {
        zIndex: -1,
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width
    },
    inputContainer: {
        position: "absolute",
        width: "90%",
        backgroundColor: "transparent",
        zIndex: 2,
        paddingTop: 20,
        justifyContent: "space-between",
    },
    input: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#ddd',
        fontSize: 18,
        color: '#333',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    button: {
        position: "absolute",
        backgroundColor: "#43a047",
        width: "90%",
        bottom: 20,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10
    },
    textInput: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600",
        padding: 20,
    },
    imgStyle: {
        height: 20,
        width: 20,

    },
    imgCon: {
        position: "absolute",
        right: 20,
        top: 30,
        zIndex:2
    }
});