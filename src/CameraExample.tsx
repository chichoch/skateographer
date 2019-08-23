import React, {PureComponent} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';

import {RNCamera} from 'react-native-camera';

const PendingView = () => (
    <View
        style={{
            flex: 1,
            backgroundColor: 'lightgreen',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Text>Waiting</Text>
    </View>
);

interface State {
    isRecording: boolean;
    videoUri: string;
    hasRecorded: boolean;
}

export class CameraExample extends PureComponent {
    state = {
        isRecording: false,
        videoUri: '',
    };


    render() {
        const buttonText = this.state.isRecording ? 'STOP' : 'START';
        return (
            <View style={styles.container}>
                <RNCamera
                    style={styles.preview}
                    type={RNCamera.Constants.Type.back}

                    androidCameraPermissionOptions={{
                        title: 'Permission to use camera',
                        message: 'We need your permission to use your camera',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    androidRecordAudioPermissionOptions={{
                        title: 'Permission to use audio recording',
                        message: 'We need your permission to use your audio',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                >
                    {({camera, status, recordAudioPermissionStatus}) => {
                        if (status !== 'READY') return <PendingView/>;
                        return (
                            <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
                                <TouchableOpacity onPress={() => this.takeVideo(camera)} style={styles.capture}>
                                    <Text style={{fontSize: 14}}> {buttonText} </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                </RNCamera>
            </View>
        );
    }

    takeVideo(camera: RNCamera) {
        const uri = this.state.videoUri;
        this.state.isRecording ? this.stopRecording(camera).catch(x => console.log('SAVE ERROR!', x)) : this.startRecording(camera);
        this.setState({
            isRecording: !this.state.isRecording,
        });
    }

    startRecording = async function (camera: RNCamera) {
        const data = await camera.recordAsync()
            .then(data => CameraRoll.saveToCameraRoll(data.uri))
            .then(() => Alert.alert('Success', 'Video saved!'))
            .catch(e => console.log('ERROR', e));
        console.log('Saved to camera roll:', data);
        return data;
    };

    stopRecording = async function (camera: RNCamera) {
        const data = await camera.stopRecording();
        console.log('Stopped recording');
        return;
    };

    saveVideoToCameraRoll(uri: string) {
        const data = CameraRoll.saveToCameraRoll(uri, 'video');
        console.log('Saved to camera roll:', uri);
    }

    takePicture = async function (camera: RNCamera) {
        const options = {quality: 0.5, base64: true};
        const data = await camera.takePictureAsync(options);
        //  eslint-disable-next-line
        console.log(data.uri);
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
});