import React, {PureComponent} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';

import {RNCamera} from 'react-native-camera';
import {ButtonComponent} from "./ButtonComponent";
import {PendingView} from "./PendingView";
import Orientation from "react-native-orientation-locker";

export class CameraExample extends PureComponent {
  pinchRef = React.createRef();
  state = {
    isRecording: false,
    videoUri: '',
    hasRecorded: false,
    zoom: 0,
    orientation: 'PORTRAIT',
  };


  componentDidMount() {
    Orientation.lockToPortrait();
    Orientation.addDeviceOrientationListener(this.orientationDidChange);
  }

  componentWillUnmount() {
    Orientation.removeDeviceOrientationListener(this.orientationDidChange);
  }

  orientationDidChange = (orientation: string) => {
    console.log(orientation);
    if (orientation !== 'UNKNOWN' && !this.state.isRecording) {
      this.setState({orientation})
    }
  };

  render() {
    const {hasRecorded, videoUri, isRecording, zoom, orientation} = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.bounding}>
          <RNCamera
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            zoom={zoom}
            defaultVideoQuality={RNCamera.Constants.VideoQuality["1080p"]}
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
                <View style={{flex: 1, width: '100%'}}>
                  <View style={{flex: 1, justifyContent: 'flex-end'}}>
                    <ButtonComponent
                      isRecording={isRecording}
                      hasRecorded={hasRecorded}
                      onTakeVideo={(camera: RNCamera) => this.takeVideo(camera)}
                      onSave={(uri: string) => this.saveVideoToCameraRoll(uri)}
                      onDiscard={() => this.discardVideo()}
                      videoUri={videoUri}
                      camera={camera}
                      orientation={orientation}
                    />
                  </View>
                </View>
              )
            }}
          </RNCamera>
        </View>
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
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  bounding: {
    flex: 0,
    width: '100%',
    aspectRatio: 9 / 16,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
