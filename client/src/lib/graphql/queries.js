import { ApolloClient, gql, InMemoryCache, createHttpLink, ApolloLink, concat } from '@apollo/client';
import { getAccessToken } from '../auth';

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

export const jobsQuery = gql`
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

export async function createJob({ title, description }) {
  const mutation = gql`
    mutation($input: CreateJobInput!){
      job: createJob(input: $input) {
        JobDetail
      }
    }
    ${jobDetailFragment}
  `;

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