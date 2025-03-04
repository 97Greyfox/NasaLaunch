//import jest from 'jest';
const request = require('supertest');
const app = require('../../app');
const {mongoConnect, mongoDisconnect} = require('../../services/mongo.js')


describe('Launches API test', ()=>{

  beforeAll(async ()=>{
    await mongoConnect();
  });

  afterAll(async ()=>{
    await mongoDisconnect();
  });

  describe('Test GET /launches', ()=>{
    test('it should respond with 200', async ()=>{
      const response = await request(app)
      .get('/v1/launches')
      .expect('Content-Type', /json/)
      .expect(200);
  
    });
  });
  
  describe('Test POST /launches', ()=>{
    test('it should respond with 201 created post', async ()=>{
  
      const testData = {
        mission : 'USS Enterprise',
        rocket : 'NCC 1701-D',
        target : 'Kepler-62 f',
        launchDate : 'January 4, 2028'
      };
  
      const response = (await request(app).post('/v1/launches')).send(testData)
      .expect('Content-Type', /json/)
      .expect(201);
       
      const requestDate = new Date(testData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
  
      expect(response.body).toMatchObject({
        mission : 'USS Enterprise',
        rocket : 'NCC 1701-D',
        target : 'Kepler-62 f',
      });
      
    });
    test('should cath missing values', async ()=>{
           
      const testData = {
        mission : 'USS Enterprise',
        rocket : 'NCC 1701-D',
        target : 'Kepler-62 f',
      };   
  
      const response = (await request(app).post('/v1/launches')).send(testData)
      .expect('Content-Type', /json/)
      .expect(400);
  
      expect(response.body).toStrictEqual({
         error:'missing required launch property'
      });
  
    });
    test('should cath wrong date formats', async ()=>{
        const testData = {
          mission : 'USS Enterprise',
          rocket : 'NCC 1701-D',
          target : 'Kepler-62 f',
          launchDate : 'hello'
        };   
  
        const response = (await request(app).post('/v1/launches')).send(testData)
        .expect('Content-Type', /json/)
        .expect(400);
  
        expect(response.body).toStrictEqual({
          error:'Invalid Date' 
        });
     
    });
  
  });
})


