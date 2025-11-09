import { createSlice } from '@reduxjs/toolkit'

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    items: [],
    currentBooking: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setBookings: (state, action) => {
      state.items = action.payload
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload
    },
    addBooking: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateBooking: (state, action) => {
      const index = state.items.findIndex((b) => b._id === action.payload._id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
  },
})

export const { setBookings, setCurrentBooking, addBooking, updateBooking } = bookingSlice.actions
export default bookingSlice.reducer
