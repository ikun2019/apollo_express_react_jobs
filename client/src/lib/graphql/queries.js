import { ApolloClient, gql, InMemoryCache, createHttpLink, ApolloLink, concat } from '@apollo/client';
// import { GraphQLClient } from 'graphql-request';
import { getAccessToken } from '../auth';

// const client = new GraphQLClient('http://localhost:8080/graphql', {
//   headers: () => {
//     const accessToken = getAccessToken();
//     if (accessToken) {
//       return { 'Authorization': `Bearer ${accessToken}` };
//     }
//     return {};
//   },
// });

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
});

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { 'Authorization': `Bearer ${accessToken}` }
    })
  };
  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});

export async function getJobs() {
  const query = gql`
    query {
      jobs {
        id
        date
        title
        description
        company {
          id
          name
          description
        }
      }
    }
  `;
  // const data = await client.request(query);
  // return data.jobs;
  const result = await apolloClient.query({ query });
  return result.data.jobs;
};

export async function getJob(id) {
  const query = gql`
    query($jobId: ID!){
      job(id: $jobId) {
        id
        title
        date
        description
        company {
          id
          name
          description
        }
      }
    }
  `;
  // const data = await client.request(query, { jobId: id });
  // return data.job;
  const result = await apolloClient.query({ query, variables: { jobId: id } });
  return result.data.job;
};

export async function getCompany(id) {
  const query = gql`
    query($companyId: ID!){
      company(id: $companyId) {
        id
        name
        description
        jobs {
          id
          date
          title
        }
      }
    }
  `;
  // const data = await client.request(query, { companyId: id });
  // return data.company;
  const result = await apolloClient.query({ query, variables: { companyId: id } });
  return result.data.company;
};

export async function createJob({ title, description }) {
  const mutation = gql`
    mutation($input: CreateJobInput!){
      job: createJob(input: $input) {
        id
      }
    }
  `;
  // const data = await client.request(mutation, {
  //   input: { title, description },
  // });
  // return data.job;
  const result = await apolloClient.mutate({
    mutation,
    variables: {
      input: {
        title,
        description
      }
    }
  });
  return result.data.job;
};