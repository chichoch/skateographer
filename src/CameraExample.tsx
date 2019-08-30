import React, {PureComponent} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';

import {RNCamera} from 'react-native-camera';
import {ButtonComponent} from "./ButtonComponent";
import {PendingView} from "./PendingView";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

export class CameraExample extends PureComponent {
  pinchRef = React.createRef();
  state = {
    isRecording: false,
    videoUri: '',
    hasRecorded: false,
    zoom: 0,
    bajs: 'TEST',
  };

  onZoomChanged(value: number) {
    this.setState({zoom: value});
  }

  onGestureHandler(event: PinchGestureHandlerGestureEvent) {
    let newZoom = this.state.zoom + (event.nativeEvent.velocity / 1500);
    const s = `Zoom: ${newZoom} velocity: ${event.nativeEvent.velocity}`;
    if (newZoom > 1) {
      newZoom = 1;
    } else if (newZoom < 0) {
      newZoom = 0;
    }
    this.setState({
      bajs: s,
      zoom: newZoom,
    });
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
            return (
              <View>
                <PinchGestureHandler
                  onGestureEvent={(x: PinchGestureHandlerGestureEvent) => this.onGestureHandler(x)}
                >
                  <View>
                    <Text>{this.state.bajs}</Text>
                    <ButtonComponent
                      isRecording={isRecording}
                      hasRecorded={hasRecorded}
                      onTakeVideo={(camera: RNCamera) => this.takeVideo(camera)}
                      onSave={(uri: string) => this.saveVideoToCameraRoll(uri)}
                      onDiscard={() => this.discardVideo()}
                      onZoomChanged={(x: number) => this.onZoomChanged(x)}
                      videoUri={videoUri}
                      camera={camera}/>
                  </View>
                </PinchGestureHandler>
              </View>
            )
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
