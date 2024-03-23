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

export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only'
    },
    watchQuery: {
      fetchPolicy: 'network-only'
    },
  }
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
  const result = await apolloClient.query({
    query,
    // fetchPolicy: 'cache-first',
  });
  return result.data.jobs;
};

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    date
    title
    description
    company{
      id
      name
    }
  }
`;

export const jobByIdQuery = gql`
  query($jobId: ID!){
    job(id: $jobId) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export async function getJob(id) {
  // const data = await client.request(query, { jobId: id });
  // return data.job;
  const result = await apolloClient.query({
    query: jobByIdQuery,
    variables: { jobId: id }
  });
  return result.data.job;
};

export const companyByIdQuery = gql`
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

export async function getCompany(id) {
  // const data = await client.request(query, { companyId: id });
  // return data.company;
  const result = await apolloClient.query({ query: companyByIdQuery, variables: { companyId: id } });
  return result.data.company;
};

export async function createJob({ title, description }) {
  const mutation = gql`
    mutation($input: CreateJobInput!){
      job: createJob(input: $input) {
        JobDetail
      }
    }
    ${jobDetailFragment}
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
    },
    update: (cache, { data }) => {
      cache.writeQuery({
        query: jobByIdQuery,
        variables: { id: data.job.id },
        data,
      });
    },
  });
  return result.data.job;
};