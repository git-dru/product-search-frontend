import { createSlice, PayloadAction, Reducer, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from "axios";
import { BASE_URL } from '../../config';

import axios from 'axios';
interface AppState {
  email: string | null;
  session: {
    searchTerm: string,
    sortBy: string,
    direction: string,
  };
  selected: number[]
}

const initialState: AppState = {
  email: null,
  session : {
    searchTerm: '',
    sortBy: "id",
    direction: 'asc'
  },
  selected: []
};

interface SelectedItem {
  selected: number
}

export const selectProduct = createAsyncThunk<SelectedItem, number, { rejectValue: { errorMessage: string }}> ("product/selectProduct", async (productId: number, thunkAPI) => {
  try {
    const response = await axios.get(`${BASE_URL}/products/select/?productId=${productId}` , {withCredentials: true})
    return response.data as SelectedItem
  } catch (error) {
    const axiosError = error as AxiosError;
    return thunkAPI.rejectWithValue({ errorMessage: axiosError.message || 'Unknown error occurred' });
  }
});


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authUser: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    logout: (state) => {
      state.email = initialState.email
      state.selected = initialState.selected
      state.session = initialState.session
    },
    authSession: (state, action) => {
      state.session = {...state.session, ...action.payload};
    },
    authSelected: (state, action) => {
      state.selected = [...action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(selectProduct.pending, (state) => {
    })
    .addCase(selectProduct.fulfilled, (state, action: PayloadAction<SelectedItem>) => {
      const {selected} = action.payload
      const selectedProducts = state.selected
      const index = selectedProducts.indexOf(selected)
      if(index !== -1) {
        selectedProducts.splice(index, 1);
      } else {
        selectedProducts.push(selected);
      }
      state.selected = [...selectedProducts]
    })
    .addCase(selectProduct.rejected, (state, action) => {
    });
  }
});

export const { authUser, logout, authSession, authSelected } = authSlice.actions;
export const authReducer: Reducer<AppState> = authSlice.reducer;