import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client"

const client = new ApolloClient({
  uri: "http://206.189.58.232:3001/api",
  cache: new InMemoryCache(),
});

export default client;