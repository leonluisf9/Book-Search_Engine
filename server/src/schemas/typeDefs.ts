import gql from 'graphql-tag';

const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [Book]
  }

  type Book {
    bookId: String!
    authors: [String]
    title: String!
    description: String
    image: String
    link: String
  }

  type Auth {
    token: String!
    user: User
  }

  type Query {
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(input: BookInput!): User
    removeBook(bookId: String!): User
  }

  input BookInput {
    bookId: String!
    authors: [String]
    title: String!
    description: String
    image: String
    link: String
  }
`;

export default typeDefs;