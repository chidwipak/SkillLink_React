import { createSlice } from '@reduxjs/toolkit'

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    currentOrder: null,
    cart: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.items = action.payload
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload
    },
    addToCart: (state, action) => {
      const existing = state.cart.find((item) => item.product._id === action.payload.product._id)
      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.cart.push(action.payload)
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.product._id !== action.payload)
    },
    updateCartQuantity: (state, action) => {
      const item = state.cart.find((item) => item.product._id === action.payload.productId)
      if (item) {
        item.quantity = action.payload.quantity
      }
    },
    clearCart: (state) => {
      state.cart = []
    },
    addOrder: (state, action) => {
      state.items.unshift(action.payload)
    },
    updateOrder: (state, action) => {
      const index = state.items.findIndex((o) => o._id === action.payload._id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
    },
  },
})

export const {
  setOrders,
  setCurrentOrder,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  addOrder,
  updateOrder,
} = orderSlice.actions
export default orderSlice.reducer
