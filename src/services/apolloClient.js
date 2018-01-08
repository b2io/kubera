import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import store, { credentialsSelector } from '../redux';

const httpLink = new HttpLink({ uri: 'https://api.github.com/graphql' });

const withAuthorization = setContext((request, previousContext) => {
  const { gitHubToken } = credentialsSelector(store.getState());

  return {
    headers: {
      ...previousContext.headers,
      Authorization: gitHubToken ? `Bearer ${gitHubToken}` : null,
    },
  };
});

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: withAuthorization.concat(httpLink),
});

export default apolloClient;
