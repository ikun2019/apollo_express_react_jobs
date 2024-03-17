import { getCompany } from "./db/companies.js";
import { getJob, getJobs, getJobsByCompany, createJob } from "./db/jobs.js";
import { GraphQLError } from 'graphql';

export const resolvers = {
  Query: {
    jobs: () => getJobs(),
    job: async (parent, args, context) => {
      const job = await getJob(args.id);
      if (!job) {
        throw notFoundError('No Job found with id ' + args.id);
      }
      return job;
    },
    company: async (parent, args, context) => {
      const company = await getCompany(args.id);
      if (!company) {
        throw notFoundError('No Company found with id ' + args.id);
      }
      return company;
    },
  },

  Mutation: {
    createJob: (parent, args, context) => {
      const companyId = 'FjcJCHJALA4i';
      return createJob({
        companyId: companyId,
        title: args.title,
        description: args.description,
      });
    },
  },

  Job: {
    date: (job) => toIsoDate(job.createdAt),
    company: (job) => getCompany(job.companyId),
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id)
  }
};

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' }
  });
}

function toIsoDate(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
};