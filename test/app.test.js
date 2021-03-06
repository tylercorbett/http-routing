const request = require('supertest');
const app = require('../lib/app');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

const createPerson = (name) => {
  return request(app)
    .post('/people')
    .send({
      name: name,
      age: 100,
      favoriteColor: 'red',
      favoriteCharacterId: 1
    })
    .then(res => res.body);
};

const createTweet = (handle, message) => {
  return request(app)
    .post('/tweets')
    .send({
      handle: handle,
      message: message
    });
};


describe('app tests', () => {
  beforeEach(done => {
    rimraf('./data/people', err => {
      done(err);
    });
  });
  beforeEach(done => {
    mkdirp('./data/people', err => {
      done(err);
    });
  });

  it('creates a person', () => {
    return request(app)
      .post('/people')
      .send({
        name: 'Uncle Bob',
        age: 100,
        favoriteColor: 'red',
        favoriteCharacterId: 1
      })
      .then(res => {
        expect(res.body.favoriteCharacter.name).toContain('Luke Skywalker');
      });
  });
  it('returns all people', () => {
    const namesToCreate = ['ryan', 'ryan1', 'ryan2', 'ryan3'];
    return Promise.all(namesToCreate.map(createPerson))
      .then(() => {
        return request(app)
          .get('/people');
      })
      .then(({ body }) => {
        expect(body).toHaveLength(4);
      });
  });
  it('gets a person by id', () => {
    return createPerson('Tyler')
      .then((createdPerson) => {
        const id = createdPerson._id;
        return request(app)
          .get(`/people/${id}`);
      })
      .then(res => {
        expect(res.body.name).toContain('Tyler');
      });
  });
  it('updates a person by id', () => {
    return createPerson('Tyler')
      .then((createdPerson) => {
        const id = createdPerson._id;
        return request(app)
          .put(`/people/${id}`)
          .send({
            name: createdPerson.name,
            age: createdPerson.age,
            favoriteColor: 'green',
            _id: createdPerson._id
          })
          .then(() => {
            return request(app)
              .get(`/people/${id}`)
              .then(res => {
                expect(res.body.favoriteColor).toContain('green');
              });
          });
      });
  });
  it('deletes a person by id and returns delete count', () => {
    return createPerson('Connor')
      .then((createPerson) => {
        const id = createPerson._id;
        return request(app)
          .delete(`/people/${id}`)
          .then(res => {
            expect(res.body).toEqual({ deleted: 1 });
          });
      });
  });
});

describe.skip('tweets tests', () => {
  beforeEach(done => {
    rimraf('./data/tweets', err => {
      done(err);
    });
  });
  beforeEach(done => {
    mkdirp('./data/tweets', err => {
      done(err);
    });
  });

  it('make a tweet and send back as JSON', () => {
    return request(app)
      .post('/tweets')
      .send({
        handle: 'tylercorbett',
        message: 'Ryan is secretly a robot'
      })
      .then(res => {
        expect(res.body).toEqual({
          handle: 'tylercorbett',
          message: 'Ryan is secretly a robot',
          _id: expect.any(String) 
        });
      });
  });
  it('returns all tweets saved', () => {
    const tweetsToMake = [{
      handle: 'tylercorbett',
      message: 'Ryan is secretly a robot'
    }, 
    {
      handle: 'tylercorbett',
      message: 'Top 3 robots of all time: 3. The Iron Giant 2. Wall E 1. Ryan'
    }];
    return Promise.all(tweetsToMake.map(createTweet))
      .then(() => {
        return request(app)
          .get('/tweets');
      })
      .then(({ body }) => {
        expect(body).toHaveLength(2);
      });
  });
  it('returns a tweet by id', () => {
    return createTweet('tylerIsCool', 'I hear that Tyler is cool')
      .then(({ body }) => {
        return request(app)
          .get(`/tweets/${body._id}`)
          .then(res => {
            expect(res.body._id).toEqual(body._id);
          });
      });
  });
  it('updates an existing tweet by id', () => {
    return createTweet('tyler', 'Thank you Kayne! Very cool!')
      .then(({ body }) => {
        return request(app)
          .put(`/tweets/${body._id}`)
          .send({
            handle: 'tyler',
            message: 'Testing testing 123'
          })
          .then(res => {
            expect(res.body).toEqual({
              handle: 'tyler',
              message: 'Testing testing 123',
              _id: body._id
            });
          });
      });
  });
  it('deletes a tweet by id', () => {
    return createTweet('tyler', 'Thank you Kayne! Very cool!')
      .then(({ body }) => {
        return request(app)
          .delete(`/tweets/${body._id}`)
          .then(res => {
            expect(res.body).toEqual({ deleted: 1 });
          });
      });
  });
});


