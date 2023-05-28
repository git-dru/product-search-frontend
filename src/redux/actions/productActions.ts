import { Action } from 'redux';

export enum ProductActionTypes {
    FETCH = 'products/fetchProducts',
}

interface ProducFetchAction extends Action {
    type: ProductActionTypes.FETCH,
    payload: string
}

export const fetchProduct = (search: string): ProducFetchAction => ({
    type: ProductActionTypes.FETCH,
    payload: search
});

export type ProductActions = ProducFetchAction;