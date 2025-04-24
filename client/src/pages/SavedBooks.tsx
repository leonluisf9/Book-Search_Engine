import { useState } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME, REMOVE_BOOK } from '../utils/graphql';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // Fetch user data using Apollo Client
  const { loading, data } = useQuery(GET_ME, {
    context: {
      headers: {
        authorization: `Bearer ${Auth.loggedIn() ? Auth.getToken() : ''}`,
      },
    },
  });

  const [removeBook] = useMutation(REMOVE_BOOK);
  const userData = data?.me || { username: '', email: '', savedBooks: [] };
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) {
      console.error("No token found. User must be logged in.");
      return;
    }
    try {
      const { data } = await removeBook({
        variables: { bookId },
        context: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      });

      if (!data) {
        throw new Error('No data received from removeBook mutation');
      }

      // Remove book from local state & local storage
      removeBookId(bookId);
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  };
  if (loading) {
    return <h2>LOADING...</h2>;
  }
  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          <h1>Viewing {userData.username}'s saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => (
            <Col md='4' key={book.bookId}>
              <Card border='dark'>
                {book.image && <Card.Img src={book.image} alt={`Cover for ${book.title}`} variant='top' />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;