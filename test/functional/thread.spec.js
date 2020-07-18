'use strict'
const Factory = use('Factory')
const Thread = use('App/Models/Thread')
const { test, trait } = use('Test/Suite')('Thread')

trait('Auth/Client')
trait('Test/ApiClient')
trait('DatabaseTransactions')

test('authorized user can create threads', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const atributes = {
    title: 'test title',
    body: 'body'
  }
  const response = await client.post('/threads').loginVia(user).send(atributes).end()
  response.assertStatus(200)

  const thread = await Thread.firstOrFail()
  response.assertJSON({ thread: thread.toJSON() })
  response.assertJSONSubset({ thread: { ...atributes, user_id: user.id } })
})

test('el usuario autorizado puede eliminar threads', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create()
  const thread = await Factory.model('App/Models/Thread').create()
  const response = await client.delete(thread.url()).send().loginVia(user).end()
  console.log(response.error)
  //response.assertStatus(204)
  assert.equal(await Thread.getCount(), 0)
})

test('unathenticated user cannot create threads', async ({ client }) => {
  const response = await client.post('/threads').send({
    title: 'test title',
    body: 'body',
  }).end()

  response.assertStatus(401)
})

test('unauthenticaded user can not delete threads', async ({ assert, client }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  const response = await client.delete(thread.url()).send().end()
  response.assertStatus(401)
})