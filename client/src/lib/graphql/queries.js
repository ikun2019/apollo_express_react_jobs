import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient('http://localhost:8080/graphql');

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
  const data = await client.request(query);
  return data.jobs;
}

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
  const data = await client.request(query, { jobId: id });
  return data.job;
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
  const data = await client.request(query, { companyId: id });
  return data.company;
}