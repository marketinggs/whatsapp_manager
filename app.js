const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const readline = require('readline');

const KEYWORDS = ['GS', 'Outskill', 'growthschool', 'buildschool', 'webinar', 'workshop', 'mentorship', 'membership', 'AI', 'chatgpt'];

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code above to log in.');
});

client.on('ready', async () => {
  console.log('Client is ready. Gathering groups...');
  const chats = await client.getChats();
  const groups = chats.filter((c) => c.isGroup);

  const myGroups = [];
  for (const group of groups) {
    await group.fetchMessages({ limit: 1 }).catch(() => null); // fetch to ensure metadata
    let metadata;
    try {
      metadata = await client.getChatById(group.id._serialized);
    } catch (err) {
      console.log(`Skipping group ${group.id._serialized}: ${err.message}`);
      continue;
    }
    if (!metadata || !metadata.participants) continue;
    const me = metadata.participants.find(
      (p) => p.id._serialized === client.info.wid._serialized
    );
    if (me && me.isAdmin) {
      myGroups.push(metadata);
    }
  }

  // Save all groups to CSV
  const csvWriter = createCsvWriter({
    path: 'groups.csv',
    header: [
      { id: 'name', title: 'Name' },
      { id: 'id', title: 'ID' },
    ],
  });
  await csvWriter.writeRecords(myGroups.map((g) => ({ name: g.name, id: g.id._serialized })));
  console.log('Created groups.csv with your group list.');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter up to 3 phone numbers separated by commas: ', async (answer) => {
    rl.close();
    const numbers = answer
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n);

    if (numbers.length === 0) {
      console.log('No numbers provided. Exiting.');
      process.exit(0);
    }

    for (const group of myGroups) {
      const text = (group.name + ' ' + (group.description || '')).toLowerCase();
      const match = KEYWORDS.some((k) => text.includes(k.toLowerCase()));
      if (match) {
        for (const num of numbers) {
          const chatId = num.includes('@c.us') ? num : `${num}@c.us`;
          try {
            await client.addParticipants(group.id._serialized, [chatId]);
            await client.promoteParticipants(group.id._serialized, [chatId]);
            console.log(`Added and promoted ${num} in ${group.name}`);
          } catch (err) {
            console.log(`Failed to add/promote ${num} in ${group.name}: ${err.message}`);
          }
        }
      }
    }
    console.log('Operation complete.');
    process.exit(0);
  });
});

client.initialize();
