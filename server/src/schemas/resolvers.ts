import { GraphQLError } from 'graphql';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';

const resolvers = {
  Query: {
    // Get the logged-in user's data
    me: async (_parent: any, _args: any, context: { user?: any }) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      return await User.findById(context.user._id);
    },
  },

  Mutation: {
    // User login
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });

      if (!user || !(await user.isCorrectPassword(password))) {
        throw new GraphQLError('Invalid email or password', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // Register new user
    addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // Save a book to the user's savedBooks array
    saveBook: async (_parent: any, { input }: { input: any }, context: { user?: any }) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      return await User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: input } }, // Prevents duplicate books
        { new: true }
      );
    },

    // Remove a saved book by bookId
    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: { user?: any }) => {
      if (!context.user) {
        throw new GraphQLError('You must be logged in', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      return await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } }, // Removes book by bookId
        { new: true }
      );
    },
  },
};

export default resolvers;