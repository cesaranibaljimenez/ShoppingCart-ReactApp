import React from 'react';

import {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
} from 'react-bootstrap';

// Datos de productos
const products = [
    { name: "Apples_:", country: "Italy", cost: 3, instock: 10, image: 'apples.jpg' },
    { name: "Oranges:", country: "Spain", cost: 4, instock: 3, image: 'oranges.jpg' },
    { name: "Beans__:", country: "USA", cost: 2, instock: 5, image: 'beans.jpg' },
    { name: "Cabbage:", country: "USA", cost: 1, instock: 8, image: 'cabbage.jpg' },
];

//=========Cart=============
const Cart = (props) => {
    const { Card, Accordion, Button } = ReactBootstrap;
    let data = props.location.data ? props.location.data : products;
    console.log(`data:${JSON.stringify(data)}`);
  
    return <Accordion defaultActiveKey="0">{list}</Accordion>;
  };
  
  const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);
  
    const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData,
    });
    console.log(`useDataApi called`);
    useEffect(() => {
      console.log("useEffect Called");
      let didCancel = false;
      const fetchData = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
          const result = await axios(url);
          console.log("FETCH FROM URl");
          if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          }
        } catch (error) {
          if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      };
      fetchData();
      return () => {
        didCancel = true;
      };
    }, [url]);
    return [state, setUrl];
  };
  const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case "FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      default:
        throw new Error();
    }
  };
  
  const generateImageURL = () => {
    const randomId = Math.floor(Math.random() * 1000); // Genera un ID aleatorio entre 0 y 999
    return `https://picsum.photos/id/${randomId}/50/50`;
  };
  
  const Products = (props) => {
    const [items, setItems] = React.useState(products);
    const [cart, setCart] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const {
      Card,
      Accordion,
      Button,
      Container,
      Row,
      Col,
      Image,
      Input,
    } = ReactBootstrap;
    //  Fetch Data
    const { Fragment, useState, useEffect, useReducer } = React;
    const [query, setQuery] = useState("http://localhost:1337/api/products");
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
      "http://localhost:1337/api/products",
      {
        data: [],
      }
    );
    console.log(`Rendering Products ${JSON.stringify(data)}`);
    
    //Función para agregar productos al carrito
    const addToCart = (e) => {
      let name = e.target.name;
      let item = items.filter((item) => item.name === name)[0];//Buscar el producto
      if(item && item.instock > 0){
        //Veficiar si hay suficiente stock
        item.imageURL = generateImageURL(); // Asociar la URL de la imagen
        setCart([...cart, item]);
        //Reducir en 1 la cantidad de productos disponibles en el stock
        setItems((prevItems) =>
          prevItems.map((prevItem) =>
          prevItem.name === item.name
            ? {...prevItem, instock: prevItem.instock - 1}
            : prevItem
            )
            );
      }
      };
      
       
  
    //Función para eliminar productos del carrito
    const deleteCartItem = (index) => {
     const removedItem = cart[index];
     setCart(cart.filter((item, i)=> i !== index));
     setItems((prevItems) =>
     prevItems.map((prevItem) =>
      prevItem.name === removedItem.name ? { ...prevItem, instock: prevItem.instock + 1} : prevItem
     )
     );
    };
   
    let productList = (
      <ul style={{ listStyleType: "none" }}>
        {items.map((item, index) => (
          <li key={index}>
            <Image src={item.imageURL} width={70} roundedCircle />
            <Button variant="primary" size="large">
              {item.name}:{item.cost} (stock: {item.instock})
            </Button>
            <input name={item.name} type="submit" onClick={addToCart}></input>
          </li>
        ))}
      </ul>
    );
    
  
    let cartList = cart.map((item, index) => {
      return (
        <Card key={index}>
          <Card.Header>
            <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
              {item.name}
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse
            onClick={() => deleteCartItem(index)}
            eventKey={1 + index}
          >
            <Card.Body>
              $ {item.cost} from {item.country}
            </Card.Body>
          </Accordion.Collapse>
        </Card>
      );
    });
  
    let finalList = () => {
      let total = checkOut();
      let final = cart.map((item, index) => {
        return (
          <div key={index} index={index}>
            {item.name}
          </div>
        );
      });
      return { final, total };
    };
  
    const checkOut = () => {
      let costs = cart.map((item) => item.cost);
      const reducer = (accum, current) => accum + current;
      let newTotal = costs.reduce(reducer, 0);
      console.log(`total updated to ${newTotal}`);
      return newTotal;
    };
    // TODO: implement the restockProducts function
   
    const restockProducts = (url) => {
      doFetch(url)
        .then((response) => {
          const newData = response.data;
          let newItems = newData.map((item) => {
            let { name, country, cost, instock } = item;
            return { name, country, cost, instock };
          });
        
          console.log('New Items:', newItems);
          setItems((prevItems) => [...prevItems, ...newItems]); // Agregar nuevos productos sin sobrescribir los existentes
          console.log(newItems);
          console.log(items);
        })
        .catch((error) => {
          console.error('Error al obtener datos:', error);
        });
        
    };
    
    
    
    return (
      <Container>
        <Row>
          <Col>
            <h1>Product List</h1>
            {productList}
          </Col>
          <Col>
            <h1>Cart Contents</h1>
            <Accordion>{cartList}</Accordion>
          </Col>
          <Col>
            <h1>CheckOut </h1>
            <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
            <div> {finalList().total > 0 && finalList().final} </div>
          </Col>
        </Row>
        <Row>
          <form
            onSubmit={(event) => {
              restockProducts(`http://localhost:1337/api/products/${query}`);
              console.log(`Restock called on ${query}`);
              event.preventDefault();
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit">ReStock Products</button>
          </form>
        </Row>
      </Container>
    );
  };
  
export default Products;





  