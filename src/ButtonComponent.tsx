import * as React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, ViewStyle} from "react-native";
import Slider from "@react-native-community/slider";
import {RNCamera} from "react-native-camera";

interface Props {
  isRecording: boolean;
  hasRecorded: boolean;
  onTakeVideo: (camera: RNCamera) => void;
  onSave: (uri: string) => void;
  onDiscard: () => void;
  videoUri: string;
  camera: RNCamera;
  orientation: string;
}

export class ButtonComponent extends React.Component<Props> {

  getOrientationRotation = (orientation: string): string => {
    switch (orientation) {
      case 'PORTRAIT':
        return '0deg';
      case 'LANDSCAPE-LEFT':
        return '90deg';
      case 'LANDSCAPE-RIGHT':
        return '270deg';
      case 'PORTRAIT-UPSIDEDOWN':
        return '180deg';
      default:
        return '0deg';
    }
  };

  render() {
    const {isRecording, hasRecorded, onTakeVideo, onSave, onDiscard, videoUri, camera, orientation} = this.props;
    const buttonText = isRecording ? 'STOP' : 'REC';

    const rotateStyle = {
      transform: [{ rotate: this.getOrientationRotation(orientation) }]
    } as ViewStyle;

    const recStyle = isRecording ? styles.discard : styles.rec;

    if (hasRecorded) {
      return (
        <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity onPress={() => onSave(videoUri)}
                            style={[styles.capture, rotateStyle, styles.save]}>
            <Text style={styles.buttonText}> SAVE </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDiscard()} style={[styles.capture, rotateStyle, styles.discard]}>
            <Text style={styles.buttonText}> DISCARD </Text>
          </TouchableOpacity>
        </View>)
    }
    return (
      <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
        <TouchableOpacity onPress={() => onTakeVideo(camera)} style={[styles.capture, rotateStyle, recStyle]}>
          <Text style={styles.buttonText}> {buttonText} </Text>
        </TouchableOpacity>
      </View>
    );
  }
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
    borderRadius: 25,
    padding: 25,
    alignSelf: 'flex-end',
    margin: 20,
  },
  rec: {
    backgroundColor: '#8a0f0f',
  },
  save: {
    backgroundColor: 'green',
  },
  discard: {
    backgroundColor: '#c70c0c',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
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
