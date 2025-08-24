import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  AuthNavigator: undefined;
  ClientNavigator: undefined;
  RetailerNavigator: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  DebugAuth: undefined;
};

export type ClientStackParamList = {
  Dashboard: undefined;
  ScanQR: undefined;
  Dailyscan: undefined;
  Spin: undefined;
  ClientProfile: undefined;
  QRScannerScreen: undefined;
};

export type RetailerStackParamList = {
  RetailerHome: undefined;
};

// Navigation prop types
export type StackNavigationProp<T extends Record<string, any>> = {
  navigate: (screen: keyof T, params?: any) => void;
  goBack: () => void;
  push: (screen: keyof T, params?: any) => void;
  pop: (count?: number) => void;
  popToTop: () => void;
  reset: (state: any) => void;
  replace: (screen: keyof T, params?: any) => void;
  setParams: (params: any) => void;
  dispatch: (action: any) => void;
  canGoBack: () => boolean;
  isFocused: () => boolean;
  addListener: (event: string, callback: any) => void;
  removeListener: (event: string, callback: any) => void;
};
