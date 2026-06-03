const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/', async (req, res) => {
  try {
    const { question } = req.body
    if (!question) return res.status(400).json({ error: 'Question is required' })

    // Fetch relevant promises using text search
    const promises = await prisma.promise.findMany({
      where: {
        text: { contains: question.split(' ')[0], mode: 'insensitive' }
      },
      take: 15,
      include: {
        manifesto: { include: { party: true } },
        region: true,
        evidence: { take: 2 }
      }
    })

    const context = promises.length > 0
      ? promises.map(p =>
          `Promise: ${p.text}\nParty: ${p.manifesto?.party?.shortName}\nRegion: ${p.region?.name}\nStatus: ${p.status}\nCategory: ${p.category}`
        ).join('\n\n---\n\n')
      : 'No specific promises found for this query.'

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an Indian government accountability assistant for the Indian Manifesto Tracker platform.
You help citizens understand whether their government has delivered on election promises.
Answer based ONLY on the promise data provided. Be factual, neutral, and concise.
If data is insufficient, say so honestly. Always mention the party and current status.`
        },
        {
          role: 'user',
          content: `Based on this promise data:\n\n${context}\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    })

    res.json({
      answer: response.choices[0].message.content,
      promisesUsed: promises.length
    })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router