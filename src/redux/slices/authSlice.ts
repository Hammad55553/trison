import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  role: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; role: string }>
    ) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      
      // Save to AsyncStorage
      AsyncStorage.multiSet([
        ['userToken', action.payload.token],
        ['userRole', action.payload.role],
        ['isAuthenticated', 'true']
      ]).catch(error => {
        console.error('Error saving credentials:', error);
      });
    },
  // In the logout reducer
logout: (state) => {
  state.token = null;
  state.role = null;
  state.isAuthenticated = false;
  // Clear all auth-related keys consistently
AsyncStorage.multiRemove(['token', 'role', 'isAuthenticated'])
    .catch(error => {
      console.error('Error removing credentials:', error);
    });
},
    loadCredentials: (state, action: PayloadAction<{ token: string; role: string }>) => {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
  },
});

// Thunk to load stored credentials on app start
export const loadStoredCredentials = () => async (dispatch: any) => {
  try {
    const [[, token], [, role], [, isAuthenticated]] = await AsyncStorage.multiGet([
      'userToken',
      'userRole',
      'isAuthenticated'
    ]);

    if (token && role && isAuthenticated === 'true') {
      dispatch(authSlice.actions.loadCredentials({ token, role }));
    }
  } catch (error) {
    console.error('Failed to load credentials:', error);
  }
};

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;