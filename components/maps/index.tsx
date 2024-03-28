import MapView, { LatLng, Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { Alert, Dimensions, Image, PermissionsAndroid, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import { useEffect, useRef, useState } from 'react';
import { LocationData, position } from './types';
import MapViewDirections from 'react-native-maps-directions';
import { currloc } from '../../src/assets';
import { apiKey } from '../../src/apiKey';

export default function GoogleMaps() {
    const mapRef = useRef<MapView>(null);
    const [position, setPosition] = useState<LocationData>({
        coords: {
            accuracy: 0,
            altitude: 0,
            heading: 0,
            latitude: 30.92609815689669,
            longitude: 75.88825445502076,
            speed: 0,
        },
        extras: {
            maxCn0: 0,
            meanCn0: 0,
            satellites: 0,
        },
        mocked: false,
        timestamp: 0,
    });
    const [in_address, setInAddress] = useState<position>()
    const [dest, setDest] = useState<position>()
    const [direction, setDirection] = useState<boolean>(false)
    const moveto = async (positions: position) => {
        const camera = await mapRef.current?.getCamera()
        if (camera) {
            camera.center = positions
            mapRef.current?.animateCamera(camera, { duration: 1000 })
        }
    }

    const interpolateCoordinates = (origin: position, destination: position, steps: number) => {
        const coordinates = [];
        for (let i = 0; i <= steps; i++) {
            const lat = origin.latitude + (destination.latitude - origin.latitude) * (i / steps);
            const lng = origin.longitude + (destination.longitude - origin.longitude) * (i / steps);
            coordinates.push({ latitude: lat, longitude: lng });
        }
        return coordinates;
    };

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

    const [coordinate, setCoordinates] = useState([])
    const getwayPoits = () => {
        const coordinates = interpolateCoordinates(in_address, dest, 10);
        setCoordinates(coordinates)
    }

    const getCurrentPosition = () => {
        Geolocation.getCurrentPosition(
            (pos: any) => {
                console.log(pos)
                setPosition(pos);
                setInAddress({ latitude: pos.coords.latitude, longitude: pos.coords.latitude })
            },
            (error: any) => Alert.alert('GetCurrentPosition Error', JSON.stringify(error)),
            { enableHighAccuracy: true }
        );
    };

    useEffect(() => {
        requestLocationPermission()
        const intervalId = setInterval(requestLocationPermission, 10 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [position.coords.latitude])

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                style={styles.map}
                initialRegion={{
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                }}
            >
                {direction && dest && in_address &&
                    <MapViewDirections
                        origin={in_address}
                        destination={dest}
                        apikey={apiKey}
                        strokeWidth={3}
                        strokeColor="hotpink"
                    />}
                {in_address && <Marker coordinate={in_address} />}
                {dest && <Marker coordinate={dest} />}
                {direction && in_address && dest && <Polyline
                    coordinates={coordinate}
                    strokeColor="#000"
                    strokeWidth={6}
                />}
            </MapView>

            <View style={styles.inputContainer}>
                <GooglePlacesAutocomplete
                    styles={styles.input}
                    placeholder='Source Address'
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                        let positions = {
                            latitude: details?.geometry?.location.lat || 0,
                            longitude: details?.geometry?.location.lng || 0
                        }
                        setInAddress(positions)
                        console.log(JSON.stringify(data))
                        moveto(positions)
                    }}
                    query={{
                        key: apiKey,
                        language: 'en',
                    }}
                />
                <TouchableOpacity style={styles.imgCon} onPress={() => getCurrentPosition()}>
                    <Image source={currloc} style={styles.imgStyle} />
                </TouchableOpacity>
                <GooglePlacesAutocomplete
                    styles={[styles.input, { marginTop: 30 }]}
                    placeholder='Destinition addresss'
                    fetchDetails={true}
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
            <TouchableOpacity style={styles.button} onPress={() => { setDirection(true); getwayPoits() }}>
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
        justifyContent: "space-between"
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
        top: 30
    }
});