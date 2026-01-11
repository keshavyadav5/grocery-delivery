import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IGrocery {
    _id: string,
    name: string,
    category: string,
    price: string,
    unit: string,
    quantity: number,
    image: string,
    createdAt?: Date,
    updatedAt?: Date
}

interface ICartSlice {
    cartData: IGrocery[],
    subTotal: number,
    deliveryFee: number,
    finalTotal: number
}

// Load cart from localStorage
const loadCartFromLocalStorage = (): ICartSlice => {
    try {
        if (typeof window !== 'undefined') {
            const serializedCart = localStorage.getItem('cart');
            if (serializedCart) {
                return JSON.parse(serializedCart);
            }
        }
    } catch (err) {
        console.error('Error loading cart from localStorage:', err);
    }
    return {
        cartData: [],
        subTotal: 0,
        deliveryFee: 40,
        finalTotal: 40
    };
};

// Save cart to localStorage
const saveCartToLocalStorage = (state: ICartSlice) => {
    try {
        if (typeof window !== 'undefined') {
            const serializedCart = JSON.stringify(state);
            localStorage.setItem('cart', serializedCart);
        }
    } catch (err) {
        console.error('Error saving cart to localStorage:', err);
    }
};

const initialState: ICartSlice = loadCartFromLocalStorage();

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<IGrocery>) => {
            state.cartData.push(action.payload);
            cartSlice.caseReducers.calculateTotals(state);
            saveCartToLocalStorage(state);
        },
        increaseQuantity: (state, action: PayloadAction<string>) => {
            const item = state.cartData.find(i => i._id == action.payload);
            if (item) {
                item.quantity = item.quantity + 1;
            }
            cartSlice.caseReducers.calculateTotals(state);
            saveCartToLocalStorage(state);
        },
        decreaseQuantity: (state, action: PayloadAction<string>) => {
            const item = state.cartData.find(i => i._id == action.payload);
            if (item?.quantity && item.quantity > 1) {
                item.quantity = item.quantity - 1;
            } else {
                state.cartData = state.cartData.filter(i => i._id !== action.payload);
            }
            cartSlice.caseReducers.calculateTotals(state);
            saveCartToLocalStorage(state);
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cartData = state.cartData.filter(i => i._id !== action.payload);
            cartSlice.caseReducers.calculateTotals(state);
            saveCartToLocalStorage(state);
        },
        clearCart: (state) => {
            state.cartData = [];
            state.subTotal = 0;
            state.deliveryFee = 40;
            state.finalTotal = 40;
            saveCartToLocalStorage(state);
        },
        calculateTotals: (state) => {
            state.subTotal = state.cartData.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
            state.deliveryFee = state.subTotal > 100 ? 0 : 40;
            state.finalTotal = state.subTotal + state.deliveryFee;
        }
    }
});

export const { addToCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;