import React, {PureComponent} from 'react';
import {Alert, Animated, Easing, PanResponder, PanResponderInstance, StyleSheet, Text, View} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';

import {RNCamera} from 'react-native-camera';
import {ButtonComponent} from "./ButtonComponent";
import {PendingView} from "./PendingView";
import {PinchGestureHandlerGestureEvent,} from 'react-native-gesture-handler';
import Orientation from "react-native-orientation-locker";

export class CameraExample extends PureComponent {
  private _panResponder: PanResponderInstance;
  private _animatedZoom: Animated.Value;
  _zoom: number;

  constructor(props: any) {
    super(props);
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        this.onZoom(gestureState.dy);
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
    this._animatedZoom = new Animated.Value(0);
    this._zoom = 0;
    this._animatedZoom.addListener((x) => this._zoom = x.value);
  }

  pinchRef = React.createRef();

  state = {
    isRecording: false,
    videoUri: '',
    hasRecorded: false,
    zoom: 0,
    debug: 'TEST',
    orientation: 'PORTRAIT',
  };

  onZoom(distance: number) {
    let newZoom = this.state.zoom + (distance / 100000);
    if (newZoom > 1) {
      newZoom = 1;
    } else if (newZoom < 0) {
      newZoom = 0;
    }
    this._animatedZoom.setValue(newZoom);

    //this.setState({zoom: newZoom})
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
      debug: s,
      zoom: newZoom,
    });
  }

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
      this.setState({orientation});
      this.forceUpdate();
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
            zoom={this._zoom}
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
                  <View
                    style={{flex: 1, opacity: 0.5, backgroundColor: 'blue'}}
                    {...this._panResponder.panHandlers}
                  >
                    <View style={{flex: 1, justifyContent: 'flex-end'}}>
                      <Text>{this.state.debug}</Text>
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
    /*
    const recordOptions = {
      codec:
    };
    */
    const data = await camera.recordAsync()
      .then(x => {
        console.log('Finished recording', x.uri);
        console.log('Video codec', x.codec);
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
    aspectRatio: 9 / 16, // TODO Needs to work
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
