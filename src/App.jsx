import React from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import axios from "axios";
import Drawer from "./components/Drawer";
import { useEffect, useState } from "react";
import AppContext from "./context";

import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import Orders from "./pages/Orders";

function App() {
  const [cartOpened, setCartOpened] = useState(false);
  const [items, setItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cartResponse, favoritesResponse, itemsResponse] =
          await Promise.all([
            axios.get("https://63ce906fd2e8c29a9bda1d7b.mockapi.io/cart"),
            axios.get("https://63d654d0e60d57436976b65b.mockapi.io/favorites"),
            axios.get("https://63ce906fd2e8c29a9bda1d7b.mockapi.io/items"),
          ]);

        // const cartResponse = await axios.get(
        //   "https://63ce906fd2e8c29a9bda1d7b.mockapi.io/cart"
        // );
        // const favoritesResponse = await axios.get(
        //   "https://63d654d0e60d57436976b65b.mockapi.io/favorites"
        // );
        // const itemsResponse = await axios.get(
        //   "https://63ce906fd2e8c29a9bda1d7b.mockapi.io/items"
        // );

        setIsLoading(false);
        setCartItems(cartResponse.data);
        setFavorites(favoritesResponse.data);
        setItems(itemsResponse.data);
      } catch (error) {
        alert("Ошибка при запросе данных");
        console.log(error);
      }
    }

    fetchData();
  }, []);

  const onAddToCard = async (obj) => {
    try {
      const findItem = cartItems.find(
        (item) => Number(item.parentId) === Number(obj.id)
      );
      if (findItem) {
        setCartItems((prev) =>
          prev.filter((item) => Number(item.parentId) !== Number(obj.id))
        );
        await axios.delete(
          `https://63ce906fd2e8c29a9bda1d7b.mockapi.io/cart/${findItem.id}`
        );
      } else {
        const { data } = await axios.post(
          "https://63ce906fd2e8c29a9bda1d7b.mockapi.io/cart",
          obj
        ); //отправляем на бэк
        setCartItems((prev) => [...prev, data]); //предыдущее состояние плюч новый обьект obj
      }
    } catch (error) {
      alert("Ошибка при добавлении товара в корзину");
      console.log(error);
    }
  };

  const onRemoveItem = async (id) => {
    try {
      setCartItems((prev) =>
        prev.filter((item) => Number(item.id) !== Number(id))
      );
      await axios.delete(
        `https://63ce906fd2e8c29a9bda1d7b.mockapi.io/cart/${id}`
      );
    } catch (error) {
      alert("Ошибка при удалении товара изкорзины");
      console.log(error);
    }
  };

  const onAddToFavorite = async (obj) => {
    try {
      if (favorites.find((favObj) => Number(favObj.id) === Number(obj.id))) {
        axios.delete(
          `https://63d654d0e60d57436976b65b.mockapi.io/favorites/${obj.id}`
        );
        setFavorites((prev) =>
          prev.filter((item) => Number(item.id) !== Number(obj.id))
        );
      } else {
        const { data } = await axios.post(
          "https://63d654d0e60d57436976b65b.mockapi.io/favorites",
          obj
        );
        setFavorites((prev) => [...prev, data]); //предыдущее состояние плюс новый обьект obj
      }
    } catch (error) {
      alert("Не удалось добавить в избранное");
      console.log(error);
    }
  };

  const onChangeSearchInput = (event) => {
    console.log(event.target.value);
    setSearchValue(event.target.value);
  };

  const isItemAdded = (id) => {
    return cartItems.some((obj) => Number(obj.parentId) === Number(id));
  };

  return (
    <AppContext.Provider
      value={{
        items,
        cartItems,
        favorites,
        isItemAdded,
        onAddToFavorite,
        onAddToCard,
        setCartOpened,
        setCartItems,
      }}
    >
      <div className="wrapper clear">
        <Drawer
          items={cartItems}
          onRemove={onRemoveItem}
          onClose={() => setCartOpened(false)}
          opened={cartOpened}
        />

        <Header onClickCart={() => setCartOpened(true)} />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                items={items}
                cartItems={cartItems}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                onChangeSearchInput={onChangeSearchInput}
                onAddToFavorite={onAddToFavorite}
                onAddToCard={onAddToCard}
                isLoading={isLoading}
              />
            }
            exact
          ></Route>

          <Route path="/favorites" element={<Favorites />} exact></Route>

          <Route path="/orders" element={<Orders />} exact></Route>
        </Routes>
      </div>
    </AppContext.Provider>
  );
}

export default App;
