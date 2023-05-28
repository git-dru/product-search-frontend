import React, { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";

import { Product, fetchProducts } from "../redux/reducers/productReducers";
import { selectProduct } from "../redux/reducers/userReducer";
import { AppDispatch } from "../redux/store";
import { authSelected } from "../redux/actions/userActions";

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ProductTable: React.FC = () => {
  const products = useSelector((state: RootState) => state.product.products);
  const status = useSelector((state: RootState) => state.product.status);
  const error = useSelector((state: RootState) => state.product.error);
  const session = useSelector((state: RootState) => state.auth.session);

  const selected = useSelector((state: RootState) => state.auth.selected);

  const [searchTerm, setSearchTerm] = useState<string>(session.searchTerm);
  const [sortField, setSortField] = useState<string>(session.sortBy);
  const [sortDirection, setSortDirection] = useState<string>(session.direction);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const dispatch: AppDispatch = useDispatch();

  const onSelectProduct = (productId: number) => {
    const index = selected.indexOf(productId);
    const updated =
      index > -1
        ? [...selected.slice(0, index), ...selected.slice(index + 1)]
        : [...selected, productId];
    dispatch(authSelected(updated));
    dispatch(selectProduct(productId));
  };

  useEffect(() => {
    const direction = sortDirection === "desc" ? "-" : "";
    const prams: string = `search=${debouncedSearchTerm}&sort=${direction}${sortField}`;
    dispatch(fetchProducts(prams));
  }, [dispatch, debouncedSearchTerm, sortDirection, sortField]);

  const onSort = (field: string) => {
    setSortField(field);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <>
      <input
        type="text"
        value={searchTerm}
        className="mb-3"
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products..."
      />
      {status === "loading" && <div>Loading...</div>}
      {status === "failed" && <div>Error: {error}</div>}
      {status === "idle" && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              {["", "id", "name", "description", "price", "stock"].map(
                (field: string) => (
                  <th onClick={() => onSort(field)} key={field}>
                    {field}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((product: Product) => (
              <tr key={product.id} onClick={() => onSelectProduct(product.id)}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.indexOf(product.id) > -1}
                    onChange={() => onSelectProduct(product.id)}
                  />
                </td>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default ProductTable;
