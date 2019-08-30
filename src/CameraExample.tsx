import React, {PureComponent} from 'react';
import {Alert, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';

import {RNCamera} from 'react-native-camera';
import Slider from "@react-native-community/slider";

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

export class CameraExample extends PureComponent {
  state = {
    isRecording: false,
    videoUri: '',
    hasRecorded: false,
    zoom: 0,
  };

  onZoomChanged(value: number) {
    this.setState({zoom: value});
  }

  render() {
    const buttonText = this.state.isRecording ? 'STOP' : 'START';
    const {hasRecorded, videoUri, isRecording, zoom} = this.state;
    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          zoom={zoom}
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
            if (hasRecorded) {
              return (
                <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
                  <TouchableOpacity onPress={() => this.saveVideoToCameraRoll(videoUri)}
                                    style={styles.capture}>
                    <Text style={{fontSize: 14}}> SAVE </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.discardVideo()} style={styles.capture}>
                    <Text style={{fontSize: 14}}> DISCARD </Text>
                  </TouchableOpacity>
                  <Slider
                    style={{position: 'absolute', right: 20, bottom: 20, width: 40, height: 400}}
                    minimumValue={0}
                    maximumValue={1}
                    onValueChange={x => this.onZoomChanged(x)}
                  />
                </View>)
            }
            return (
              <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity onPress={() => this.takeVideo(camera)} style={styles.capture}>
                  <Text style={{fontSize: 14}}> {buttonText} </Text>
                </TouchableOpacity>
                <Slider
                  style={{
                    position: 'absolute',
                    left: 20,
                    bottom: 220,
                    width: 400,
                    height: 40,
                    transform: [{rotate: '270deg'}]
                  }}
                  minimumValue={0}
                  maximumValue={0.05}
                  onValueChange={x => this.onZoomChanged(x)}
                />
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
  }

  takeVideo(camera: RNCamera) {
    const uri = this.state.videoUri;
    const {isRecording, hasRecorded} = this.state;

    if (isRecording) {
      this.stopRecording(camera).catch(x => console.log('STOP ERROR!', x));
    } else {
      this.setState({isRecording: true});
      this.startRecording(camera)
        .then(uri => this.setState({videoUri: uri, hasRecorded: true, isRecording: false}));
    }
  }

  discardVideo() {
    this.setState({hasRecorded: false})
  }

  startRecording = async function (camera: RNCamera) {
    console.log('Started recording');
    const data = await camera.recordAsync()
      .then(x => {
        console.log('Finished recording', x.uri);
        return x.uri;
      })
      .catch(e => console.log('ERROR', e));
    return data;
  };


  stopRecording = async function (camera: RNCamera) {
    const data = await camera.stopRecording();
    console.log('Stopped recording');
    return;
  };

  saveVideoToCameraRoll(uri: string) {
    const data = CameraRoll.saveToCameraRoll(uri, 'video')
      .then(() => Alert.alert('Success', 'Video saved!'))
      .then(() => this.setState({hasRecorded: false}))
      .catch(e => console.log('ERROR', e));
    console.log('Saved to camera roll:', uri);
  };

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
