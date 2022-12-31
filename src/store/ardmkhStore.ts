import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit';
import { IDmKhModel as IDmKhModel } from '@Models/IDmKhModel';
import ArDmKhService from '@Services/ArDmKhService';

// Declare an interface of the store's state.
export interface IPersonStoreState {
    isFetching: boolean;
    collection: IDmKhModel[];
}

// Create the slice.
const slice = createSlice({
    name: "person",
    initialState: {
        isFetching: false,
        collection: []
    } as IPersonStoreState,
    reducers: {
        setFetching: (state, action: PayloadAction<boolean>) => {
            state.isFetching = action.payload;
        },
        setData: (state, action: PayloadAction<IDmKhModel[]>) => {
            state.collection = action.payload;
        },
        addData: (state, action: PayloadAction<IDmKhModel>) => {
            state.collection = [...state.collection, action.payload];
        },
        updateData: (state, action: PayloadAction<IDmKhModel>) => {
            // We need to clone collection (Redux-way).
            var collection = [...state.collection];
            var entry = collection.find(x => x.id === action.payload.id);
            entry.firstName = action.payload.firstName;
            entry.lastName = action.payload.lastName;
            state.collection = [...state.collection];
        },
        deleteData: (state, action: PayloadAction<{ id: number }>) => {
            state.collection = state.collection.filter(x => x.id !== action.payload.id);
        }
    }
});

// Export reducer from the slice.
export const { reducer } = slice;

// Define action creators.
export const actionCreators = {
    search: (term?: string) => async (dispatch: Dispatch) => {
        dispatch(slice.actions.setFetching(true));

        const service = new ArDmKhService();

        const result = await service.search(term);

        if (!result.hasErrors) {
            dispatch(slice.actions.setData(result.value));
        }

        dispatch(slice.actions.setFetching(false));

        return result;
    },
    add: (model: IDmKhModel) => async (dispatch: Dispatch) => {
        dispatch(slice.actions.setFetching(true));

        const service = new ArDmKhService();

        const result = await service.add(model);

        if (!result.hasErrors) {
            model.id = result.value;
            dispatch(slice.actions.addData(model));
        }

        dispatch(slice.actions.setFetching(false));

        return result;
    },
    update: (model: IDmKhModel) => async (dispatch: Dispatch) => {
        dispatch(slice.actions.setFetching(true));

        const service = new ArDmKhService();

        const result = await service.update(model);

        if (!result.hasErrors) {
            dispatch(slice.actions.updateData(model));
        }

        dispatch(slice.actions.setFetching(false));

        return result;
    },
    delete: (id: number) => async (dispatch: Dispatch) => {
        dispatch(slice.actions.setFetching(true));

        const service = new ArDmKhService();

        const result = await service.delete(id);

        if (!result.hasErrors) {
            dispatch(slice.actions.deleteData({ id }));
        }

        dispatch(slice.actions.setFetching(false));

        return result;
    }
};
