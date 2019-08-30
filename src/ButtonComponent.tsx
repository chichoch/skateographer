import * as React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Slider from "@react-native-community/slider";
import {RNCamera} from "react-native-camera";

interface Props {
  isRecording: boolean;
  hasRecorded: boolean;
  onTakeVideo: (camera: RNCamera) => void;
  onSave: (uri: string) => void;
  onDiscard: () => void;
  onZoomChanged: (x: number) => void;
  videoUri: string;
  camera: RNCamera;
}

export class ButtonComponent extends React.Component<Props> {

  render() {
    const {isRecording, hasRecorded, onTakeVideo, onSave, onDiscard, onZoomChanged, videoUri, camera} = this.props;
    const buttonText = isRecording ? 'STOP' : 'START';

    if (hasRecorded) {
      return (
        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity onPress={() => onSave(videoUri)}
                            style={styles.capture}>
            <Text style={{fontSize: 14}}> SAVE </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDiscard()} style={styles.capture}>
            <Text style={{fontSize: 14}}> DISCARD </Text>
          </TouchableOpacity>
          <ZoomSlider onZoomChanged={x => onZoomChanged(x)}/>
        </View>)
    }
    return (
      <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
        <TouchableOpacity onPress={() => onTakeVideo(camera)} style={styles.capture}>
          <Text style={{fontSize: 14}}> {buttonText} </Text>
        </TouchableOpacity>
        <ZoomSlider onZoomChanged={x => onZoomChanged(x)}/>
      </View>
    );
  }
}

type ZoomSliderProps = {
  onZoomChanged: (x: number) => void;
}

const ZoomSlider = ({onZoomChanged}: ZoomSliderProps) => (
  <View/>
  /*<Slider
    style={styles.slider}
    minimumValue={0}
    maximumValue={1}
    onValueChange={x => onZoomChanged(x)}
  />*/
);


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
    alignSelf: 'flex-end',
    margin: 20,
  },
  slider: {
    position: 'absolute',
    left: 20,
    bottom: 220,
    width: 400,
    height: 40,
    transform: [{rotate: '270deg'}]
  }
});
