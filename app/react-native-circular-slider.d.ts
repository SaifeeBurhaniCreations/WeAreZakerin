declare module 'react-native-circular-slider' {
    import { Component } from 'react';
    import { ViewStyle } from 'react-native';
  
    interface CircularSliderProps {
      value: number;
      onChange: (value: number) => void;
      min?: number;
      max?: number;
      strokeWidth?: number;
      openingRadian?: number;
      buttonRadius?: number;
      trackColor?: string;
      progressColor?: string;
      containerStyle?: ViewStyle;
    }
  
    export default class CircularSlider extends Component<CircularSliderProps> {}
  }
  