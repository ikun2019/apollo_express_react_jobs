import { companyLoader, getCompany } from "./db/companies.js";
import { getJob, getJobs, getJobsByCompany, createJob, deleteJob, updateJob, countJobs } from "./db/jobs.js";
import { GraphQLError } from 'graphql';

export const resolvers = {
  Query: {
    jobs: async (parent, args, context) => {
      const items = await getJobs(args.limit, args.offset);
      const totalCount = await countJobs();
      return {
        items,
        totalCount,
      };
    },
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
      console.log('context=>', context);
      if (!context.user) {
        throw unauthorizedError('Missing authentication');
      }
      const companyId = context.user.companyId;
      return createJob({
        companyId: companyId,
        title: args.input.title,
        description: args.input.description,
      });
    },
    deleteJob: async (parent, args, context) => {
      if (!context.user) {
        throw unauthorizedError('Missing authentication');
      };
      const job = await deleteJob(args.id, context.user.companyId);
      if (!job) {
        throw notFoundError('Missing job');
      };
      return job;
    },
    updateJob: async (parent, { input: { id, title, description } }, context) => {
      if (!context.user) {
        throw unauthorizedError('Missing authentication');
      }
      const job = await updateJob({ id, companyId, title, description });
      if (!job) {
        throw notFoundError('No Job found with id ' + id);
      };
      return job;
    },
  },

  Job: {
    date: (job) => toIsoDate(job.createdAt),
    company: (job, args, { companyLoader }) => {
      return companyLoader.load(job.companyId)
    },
  },

  Company: {
    jobs: (company) => getJobsByCompany(company.id)
  }
};

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' }
  });
};

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'NOT_FOUND' }
  })
}

function toIsoDate(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
};