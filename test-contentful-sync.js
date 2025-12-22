const contentful = require('contentful')

const client = contentful.createClient({
  space: 'navontrqk0l3',
  environment: 'master',
  accessToken: '83Q5hThGBPCIgXAYX7Fc-gSUN-psxg_j-F-gXSskQBc'
})

async function testSync() {
  console.log('Testing Contentful synchronization...\n')
  
  const entryIds = [
    '2oEdTZbpl7jBePWZYopPgx',
    'T76BWqmX6HjjBAYwn7UHt'
  ]
  
  for (const entryId of entryIds) {
    try {
      console.log(`Fetching entry: ${entryId}`)
      const entry = await client.getEntry(entryId)
      console.log(`✓ Successfully retrieved entry: ${entry.sys.id}`)
      console.log(`  Content Type: ${entry.sys.contentType.sys.id}`)
      console.log(`  Created: ${entry.sys.createdAt}`)
      console.log(`  Updated: ${entry.sys.updatedAt}`)
      console.log(`  Fields:`, Object.keys(entry.fields))
      console.log('---')
    } catch (error) {
      console.error(`✗ Failed to fetch entry ${entryId}:`, error.message)
      console.log('---')
    }
  }
}

testSync()