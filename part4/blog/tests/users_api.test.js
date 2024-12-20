const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./utils/test_helper');
const app = require('../app');

const api = supertest(app);

describe('when there is initially one user in db', () => {
  beforeEach(async () => helper.resetDb());

  describe('viewing all users', () => {
    test('returns correct amount of users', async () => {
      const response = await api.get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.strictEqual(response.body.length, helper.initialUsers.length);
    });

    test('has id property', async () => {
      const response = await api.get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert(response.body[0].id);
    });

    test('has blogs property', async () => {
      const response = await api.get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert(response.body[0].blogs);
      assert.strictEqual(response.body[0].blogs.length, helper.initialBlogs.length);
      assert(response.body[0].blogs.every(b => b.id));

      const blog = helper.initialBlogs[0];
      assert(response.body[0].blogs.some(b => b.title === blog.title && b.author === blog.author && b.url === blog.url));
    });
  });

  describe('creating a new user', () => {
    test('creation succeeds with a fresh username', async () => {
      await api
        .post('/api/users')
        .send(helper.newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersInDb = await helper.usersInDb();
      assert.strictEqual(usersInDb.length, helper.initialUsers.length + 1);

      const { id, ...addedUser } = usersInDb[usersInDb.length - 1]; // Check if the new blog post has the correct values
      const expectedUser = { username: helper.newUser.username, name: helper.newUser.name, blogs: [] };
      assert.deepStrictEqual(addedUser, expectedUser);
    });

    describe('invalid user', () => {
      test('returns 400 if username is missing', () => {
        const userWithoutUsername = { ...helper.newUser, username: undefined };
        return api
          .post('/api/users')
          .send(userWithoutUsername)
          .expect(400);
      });

      test('returns 400 if username is too short', () => {
        const userWithShortUsername = { ...helper.newUser, username: 'ab' };
        return api
          .post('/api/users')
          .send(userWithShortUsername)
          .expect(400);
      });

      test('returns 400 if username is not unique', () => {
        const userWithDuplicateUsername = { ...helper.newUser, username: helper.initialUsers[0].username };
        return api
          .post('/api/users')
          .send(userWithDuplicateUsername)
          .expect(400);
      });
    });

    describe('invalid password', () => {
      test('returns 400 if password is missing', () => {
        const userWithoutPassword = { ...helper.newUser, password: undefined };
        return api
          .post('/api/users')
          .send(userWithoutPassword)
          .expect(400);
      });


      test('returns 400 if password is too short', () => {
        const userWithShortPassword = { ...helper.newUser, password: 'ab' };
        return api
          .post('/api/users')
          .send(userWithShortPassword)
          .expect(400);
      });
    });
  });
});

after(async () => await mongoose.connection.close());